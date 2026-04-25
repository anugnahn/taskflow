package com.taskflow.taskflow.project;

import com.taskflow.taskflow.tenant.TenantContext;
import com.taskflow.taskflow.workspace.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final WorkspaceRepository workspaceRepository;

    public Project createProject(String name, String description) {
        String tenantId = TenantContext.getTenantId();
        var workspace = workspaceRepository.findById(UUID.fromString(tenantId))
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        Project project = Project.builder()
                .name(name)
                .description(description)
                .workspace(workspace)
                .tenantId(tenantId)
                .build();

        return projectRepository.save(project);
    }

    public List<Project> getProjects() {
        return projectRepository.findByTenantId(TenantContext.getTenantId());
    }

    public Project getProject(UUID id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }
}