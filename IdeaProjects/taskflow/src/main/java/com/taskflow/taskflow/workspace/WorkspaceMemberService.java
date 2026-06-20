package com.taskflow.taskflow.workspace;

import com.taskflow.taskflow.tenant.TenantContext;
import com.taskflow.taskflow.user.User;
import com.taskflow.taskflow.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkspaceMemberService {

    private final WorkspaceMemberRepository memberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public WorkspaceMember inviteMember(String email, String name,
                                        String password, WorkspaceMember.Role role) {
        String tenantId = TenantContext.getTenantId();
        Workspace workspace = workspaceRepository
                .findById(UUID.fromString(tenantId))
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        User user;
        if (userRepository.existsByEmail(email)) {
            user = userRepository.findByEmail(email).orElseThrow();
        } else {
            user = User.builder()
                    .email(email)
                    .name(name)
                    .password(passwordEncoder.encode(password))
                    .provider(User.AuthProvider.LOCAL)
                    .build();
            userRepository.save(user);
        }

        if (memberRepository.existsByWorkspaceIdAndUserId(
                workspace.getId(), user.getId())) {
            throw new RuntimeException("User is already a member");
        }

        WorkspaceMember member = WorkspaceMember.builder()
                .workspace(workspace)
                .user(user)
                .role(role)
                .build();

        return memberRepository.save(member);
    }

    public List<WorkspaceMember> getMembers() {
        String tenantId = TenantContext.getTenantId();
        return memberRepository.findByWorkspaceId(UUID.fromString(tenantId));
    }

    public void removeMember(UUID memberId) {
        memberRepository.deleteById(memberId);
    }
}