package com.taskflow.taskflow.workspace;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class WorkspaceMemberController {

    private final WorkspaceMemberService memberService;

    @PostMapping("/invite")
    public ResponseEntity<WorkspaceMember> inviteMember(@RequestBody Map<String, String> body) {
        WorkspaceMember.Role role = WorkspaceMember.Role.valueOf(
                body.getOrDefault("role", "MEMBER"));
        return ResponseEntity.ok(memberService.inviteMember(
                body.get("email"),
                body.get("name"),
                body.get("password"),
                role
        ));
    }

    @GetMapping
    public ResponseEntity<List<WorkspaceMember>> getMembers() {
        return ResponseEntity.ok(memberService.getMembers());
    }

    @DeleteMapping("/{memberId}")
    public ResponseEntity<Void> removeMember(@PathVariable UUID memberId) {
        memberService.removeMember(memberId);
        return ResponseEntity.ok().build();
    }
}