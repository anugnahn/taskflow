package com.taskflow.taskflow.workspace;

import com.taskflow.taskflow.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, UUID> {
    Optional<Workspace> findByOwner(User owner);
    Optional<Workspace> findBySlug(String slug);
}