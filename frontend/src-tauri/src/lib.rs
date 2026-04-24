use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State};

struct AppState {
    db: Mutex<Connection>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Execution {
    pub id: String,
    pub project: String,
    pub agent: String,
    pub timestamp: String,
    pub status: String,
    pub prompt: String,
    pub context_files: Vec<String>,
    pub skills_used: Vec<String>,
    pub tools_used: Vec<String>,
    pub stdout: String,
    pub stderr: String,
    pub exit_code: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExecutionSummary {
    pub id: String,
    pub project: String,
    pub agent: String,
    pub timestamp: String,
    pub status: String,
    pub prompt: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ContextFile {
    pub execution_id: String,
    pub path: String,
    pub content: String,
    pub size_bytes: i64,
}

fn get_db_path(app: &AppHandle) -> PathBuf {
    let app_dir = app.path().app_data_dir().expect("Failed to get app data dir");
    fs::create_dir_all(&app_dir).expect("Failed to create app data dir");
    app_dir.join("agent-lens.db")
}

fn init_db(app: &AppHandle) -> Result<Connection, Box<dyn std::error::Error>> {
    let db_path = get_db_path(app);
    let conn = Connection::open(&db_path)?;

    // Set WAL journal mode
    {
        let mut stmt = conn.prepare("PRAGMA journal_mode=WAL")?;
        let _: Option<String> = stmt.query_row([], |row| row.get(0))?;
    }

    conn.execute(
        "CREATE TABLE IF NOT EXISTS executions (
            id TEXT PRIMARY KEY,
            project TEXT NOT NULL,
            agent TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            status TEXT NOT NULL,
            prompt TEXT NOT NULL,
            context_files TEXT NOT NULL DEFAULT '[]',
            skills_used TEXT NOT NULL DEFAULT '[]',
            tools_used TEXT NOT NULL DEFAULT '[]',
            stdout TEXT NOT NULL DEFAULT '',
            stderr TEXT NOT NULL DEFAULT '',
            exit_code INTEGER NOT NULL DEFAULT 0
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS context_files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            execution_id TEXT NOT NULL,
            path TEXT NOT NULL,
            content TEXT NOT NULL,
            size_bytes INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (execution_id) REFERENCES executions(id)
        )",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_executions_timestamp ON executions(timestamp DESC)",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_executions_project ON executions(project)",
        [],
    )?;

    Ok(conn)
}

#[tauri::command]
fn get_executions(
    state: State<AppState>,
    project: Option<String>,
    status: Option<String>,
    search: Option<String>,
    limit: Option<i32>,
) -> Result<Vec<ExecutionSummary>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut sql = String::from("SELECT id, project, agent, timestamp, status, prompt FROM executions WHERE 1=1");
    let mut args: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    if let Some(ref p) = project {
        sql.push_str(" AND project = ?");
        args.push(Box::new(p.clone()));
    }
    if let Some(ref s) = status {
        sql.push_str(" AND status = ?");
        args.push(Box::new(s.clone()));
    }
    if let Some(ref q) = search {
        sql.push_str(" AND (prompt LIKE ? OR agent LIKE ? OR id LIKE ?)");
        let q = format!("%{}%", q);
        args.push(Box::new(q.clone()));
        args.push(Box::new(q.clone()));
        args.push(Box::new(q));
    }

    sql.push_str(" ORDER BY timestamp DESC");
    if let Some(l) = limit {
        sql.push_str(&format!(" LIMIT {}", l));
    }

    let args_refs: Vec<&dyn rusqlite::ToSql> = args.iter().map(|p| p.as_ref()).collect();
    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(args_refs.as_slice(), |row| {
            Ok(ExecutionSummary {
                id: row.get(0)?,
                project: row.get(1)?,
                agent: row.get(2)?,
                timestamp: row.get(3)?,
                status: row.get(4)?,
                prompt: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| e.to_string())?);
    }

    Ok(results)
}

#[tauri::command]
fn get_execution(id: String, state: State<AppState>) -> Result<Execution, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT id, project, agent, timestamp, status, prompt, context_files, skills_used, tools_used, stdout, stderr, exit_code
             FROM executions WHERE id = ?",
        )
        .map_err(|e| e.to_string())?;

    let exec = stmt
        .query_row([&id], |row| {
            let context_files_str: String = row.get(6)?;
            let skills_used_str: String = row.get(7)?;
            let tools_used_str: String = row.get(8)?;
            Ok(Execution {
                id: row.get(0)?,
                project: row.get(1)?,
                agent: row.get(2)?,
                timestamp: row.get(3)?,
                status: row.get(4)?,
                prompt: row.get(5)?,
                context_files: serde_json::from_str(&context_files_str).unwrap_or_default(),
                skills_used: serde_json::from_str(&skills_used_str).unwrap_or_default(),
                tools_used: serde_json::from_str(&tools_used_str).unwrap_or_default(),
                stdout: row.get(9)?,
                stderr: row.get(10)?,
                exit_code: row.get(11)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(exec)
}

#[tauri::command]
fn save_execution(execution: Execution, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let context_files_json = serde_json::to_string(&execution.context_files).map_err(|e| e.to_string())?;
    let skills_used_json = serde_json::to_string(&execution.skills_used).map_err(|e| e.to_string())?;
    let tools_used_json = serde_json::to_string(&execution.tools_used).map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT OR REPLACE INTO executions (id, project, agent, timestamp, status, prompt, context_files, skills_used, tools_used, stdout, stderr, exit_code)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        params![
            execution.id,
            execution.project,
            execution.agent,
            execution.timestamp,
            execution.status,
            execution.prompt,
            context_files_json,
            skills_used_json,
            tools_used_json,
            execution.stdout,
            execution.stderr,
            execution.exit_code,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn get_context_files(execution_id: String, state: State<AppState>) -> Result<Vec<ContextFile>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT execution_id, path, content, size_bytes FROM context_files WHERE execution_id = ?")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([&execution_id], |row| {
            Ok(ContextFile {
                execution_id: row.get(0)?,
                path: row.get(1)?,
                content: row.get(2)?,
                size_bytes: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| e.to_string())?);
    }

    Ok(results)
}

#[tauri::command]
fn get_projects(state: State<AppState>) -> Result<Vec<String>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT DISTINCT project FROM executions ORDER BY project")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            let project: String = row.get(0)?;
            Ok(project)
        })
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| e.to_string())?);
    }

    Ok(results)
}

#[tauri::command]
fn delete_execution(id: String, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM context_files WHERE execution_id = ?", [&id])
        .map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM executions WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn clear_all(state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM context_files", [])
        .map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM executions", []).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_projects_dir() -> Vec<String> {
    let mut projects = Vec::new();

    if let Some(home) = dirs::home_dir() {
        let candidates = vec![
            home.join("openclaw"),
            home.join("DEV"),
            home.join("Documents"),
        ];

        for candidate in candidates {
            if candidate.exists() && candidate.is_dir() {
                if let Ok(entries) = fs::read_dir(&candidate) {
                    for entry in entries.flatten() {
                        let path = entry.path();
                        if path.is_dir() {
                            let name = path.file_name()
                                .map(|n| n.to_string_lossy().to_string())
                                .unwrap_or_default();
                            if !name.starts_with('.') && name != "node_modules" && name != "target" {
                                projects.push(path.to_string_lossy().to_string());
                            }
                        }
                    }
                }
            }
        }
    }

    projects
}

#[tauri::command]
fn read_vault_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read {}: {}", path, e))
}

#[tauri::command]
fn list_vault_files(dir: String, extensions: Vec<String>) -> Vec<String> {
    let mut files = Vec::new();
    let path = PathBuf::from(&dir);

    if !path.exists() || !path.is_dir() {
        return files;
    }

    fn walk_dir(dir: &PathBuf, extensions: &[String], files: &mut Vec<String>, depth: usize) {
        if depth > 4 {
            return;
        }
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    let name = path.file_name()
                        .map(|n| n.to_string_lossy().to_string())
                        .unwrap_or_default();
                    if !name.starts_with('.') && name != "node_modules" && name != "dist" && name != "target" && name != ".git" {
                        walk_dir(&path, extensions, files, depth + 1);
                    }
                } else if path.is_file() {
                    if let Some(ext) = path.extension() {
                        let ext_str = ext.to_string_lossy().to_string();
                        if extensions.iter().any(|e| e == "*" || e == &ext_str) {
                            files.push(path.to_string_lossy().to_string());
                        }
                    }
                }
            }
        }
    }

    walk_dir(&path, &extensions, &mut files, 0);
    files
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let conn = init_db(app.handle())?;
            app.manage(AppState { db: Mutex::new(conn) });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_executions,
            get_execution,
            save_execution,
            get_context_files,
            get_projects,
            delete_execution,
            clear_all,
            get_projects_dir,
            read_vault_file,
            list_vault_files,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
