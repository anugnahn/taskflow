package com.taskflow.taskflow.task;

import com.taskflow.taskflow.project.ProjectRepository;
import com.taskflow.taskflow.tenant.TenantContext;
import com.taskflow.taskflow.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public Task createTask(UUID projectId, String title, String description) {
        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        int position = taskRepository.findByProjectIdOrderByPosition(projectId).size();

        Task task = Task.builder()
                .title(title)
                .description(description)
                .status(Task.TaskStatus.TODO)
                .position(position)
                .project(project)
                .tenantId(TenantContext.getTenantId())
                .build();

        Task saved = taskRepository.save(task);

        messagingTemplate.convertAndSend(
                "/topic/tasks/" + projectId, saved);

        return saved;
    }

    public List<Task> getTasksByProject(UUID projectId) {
        return taskRepository.findByProjectIdOrderByPosition(projectId);
    }

    public Task updateTaskStatus(UUID taskId, Task.TaskStatus status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus(status);
        Task saved = taskRepository.save(task);

        messagingTemplate.convertAndSend(
                "/topic/tasks/" + task.getProject().getId(), saved);

        return saved;
    }

    public Task assignTask(UUID taskId, UUID userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        task.setAssignee(user);
        return taskRepository.save(task);
    }
}