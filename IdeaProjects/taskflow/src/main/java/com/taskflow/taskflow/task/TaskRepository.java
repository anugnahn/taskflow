package com.taskflow.taskflow.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findByProjectIdOrderByPosition(UUID projectId);
    List<Task> findByTenantId(String tenantId);
    List<Task> findByAssigneeId(UUID assigneeId);
}