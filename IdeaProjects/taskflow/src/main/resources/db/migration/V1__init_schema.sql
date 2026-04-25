CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       email VARCHAR(255) NOT NULL UNIQUE,
                       name VARCHAR(255) NOT NULL,
                       password VARCHAR(255),
                       provider VARCHAR(50),
                       provider_id VARCHAR(255),
                       created_at TIMESTAMP,
                       updated_at TIMESTAMP
);

CREATE TABLE workspaces (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            name VARCHAR(255) NOT NULL,
                            slug VARCHAR(255) NOT NULL UNIQUE,
                            owner_id UUID NOT NULL REFERENCES users(id),
                            created_at TIMESTAMP
);

CREATE TABLE workspace_members (
                                   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                   workspace_id UUID NOT NULL REFERENCES workspaces(id),
                                   user_id UUID NOT NULL REFERENCES users(id),
                                   role VARCHAR(50) NOT NULL,
                                   joined_at TIMESTAMP,
                                   UNIQUE(workspace_id, user_id)
);

CREATE TABLE projects (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          name VARCHAR(255) NOT NULL,
                          description TEXT,
                          workspace_id UUID NOT NULL REFERENCES workspaces(id),
                          tenant_id VARCHAR(255) NOT NULL,
                          created_at TIMESTAMP
);

CREATE TABLE tasks (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       title VARCHAR(255) NOT NULL,
                       description TEXT,
                       status VARCHAR(50),
                       position INTEGER,
                       project_id UUID NOT NULL REFERENCES projects(id),
                       assignee_id UUID REFERENCES users(id),
                       tenant_id VARCHAR(255) NOT NULL,
                       created_at TIMESTAMP,
                       updated_at TIMESTAMP
);

CREATE TABLE notifications (
                               id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               user_id UUID NOT NULL REFERENCES users(id),
                               message TEXT NOT NULL,
                               is_read BOOLEAN DEFAULT FALSE,
                               created_at TIMESTAMP
);

CREATE INDEX idx_tasks_tenant ON tasks(tenant_id);
CREATE INDEX idx_projects_tenant ON projects(tenant_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);