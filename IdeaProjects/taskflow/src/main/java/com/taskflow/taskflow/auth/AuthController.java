package com.taskflow.taskflow.auth;

import com.taskflow.taskflow.user.User;
import com.taskflow.taskflow.user.UserRepository;
import com.taskflow.taskflow.workspace.Workspace;
import com.taskflow.taskflow.workspace.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String name = body.get("name");
        String password = body.get("password");
        String workspaceName = body.get("workspaceName");

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email already exists"));
        }

        User user = User.builder()
                .email(email)
                .name(name)
                .password(passwordEncoder.encode(password))
                .provider(User.AuthProvider.LOCAL)
                .build();
        userRepository.save(user);

        String slug = workspaceName.toLowerCase()
                .replaceAll("\\s+", "-") + "-" + UUID.randomUUID().toString().substring(0, 6);

        Workspace workspace = Workspace.builder()
                .name(workspaceName)
                .slug(slug)
                .owner(user)
                .build();
        workspaceRepository.save(workspace);

        String token = jwtUtils.generateToken(email, workspace.getId().toString());
        return ResponseEntity.ok(Map.of("token", token, "tenantId", workspace.getId().toString()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        Workspace workspace = workspaceRepository.findByOwner(user)
                .orElseThrow();

        String token = jwtUtils.generateToken(email, workspace.getId().toString());
        return ResponseEntity.ok(Map.of("token", token, "tenantId", workspace.getId().toString()));
    }
}