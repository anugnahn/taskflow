package com.taskflow.taskflow.task;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(taskService.createTask(
                UUID.fromString(body.get("projectId")),
                body.get("title"),
                body.get("description")
        ));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> getTasksByProject(@PathVariable UUID projectId) {
        return ResponseEntity.ok(taskService.getTasksByProject(projectId));
    }

    @PatchMapping("/{taskId}/status")
    public ResponseEntity<Task> updateStatus(@PathVariable UUID taskId,
                                             @RequestBody Map<String, String> body) {
        Task.TaskStatus status = Task.TaskStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(taskService.updateTaskStatus(taskId, status));
    }

    @PatchMapping("/{taskId}/assign")
    public ResponseEntity<Task> assignTask(@PathVariable UUID taskId,
                                           @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(taskService.assignTask(
                taskId,
                UUID.fromString(body.get("userId"))
        ));
    }
}