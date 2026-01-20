---
doc_type: user_stories
version: "1.0"
last_updated: [DATE]
---

# User Stories

<!--
TEMPLATE USAGE INSTRUCTIONS:
0. Update the frontmatter date when modifying this file
1. Replace all [PROJECT_NAME] and [PROJECT_SPECIFIC] markers
2. Move completed stories from "Planned" to "Completed" sections
3. Update epoch links when implementation begins
4. Check acceptance criteria as features are verified
5. Remove these usage instruction comments before committing
-->

This document captures user stories that drive feature development. User stories are reverse-engineered from completed epochs and updated as new features are planned.

**Document Structure**
- Active stories: This file (`docs/UserStories.md`)
- Implementation tracking: `docs/ToDos.md` (epochs and tasks)
- Completed work: `docs/CompletedTasks.md`

**Format:** Each story follows the standard template:
> As a [persona], I want [capability] so that [benefit].

**For LLM assistance in multi-repo workspace:**
See [User Stories Standard]([RELATIVE_PATH]/top-level-gitlab-profile/docs/common/user-stories-standard.md)

**For reference (GitLab):**
[User Stories Standard](https://gitlab.com/smart-assets.io/gitlab-profile/-/blob/master/docs/common/user-stories-standard.md)

---

## Completed Stories

### Epic: [PROJECT_SPECIFIC: Epic Name]

[PROJECT_SPECIFIC: Epic description - what theme ties these stories together?]

---

#### US-001: [PROJECT_SPECIFIC: Story Title]

> As a **[PROJECT_SPECIFIC: persona]**, I want **[PROJECT_SPECIFIC: capability]** so that **[PROJECT_SPECIFIC: benefit]**.

**Implemented in:** [PROJECT_SPECIFIC: EPOCH-XXX]

**Acceptance Criteria:**
- [x] [PROJECT_SPECIFIC: Criterion 1]
- [x] [PROJECT_SPECIFIC: Criterion 2]
- [x] [PROJECT_SPECIFIC: Criterion 3]

**Completed:** [PROJECT_SPECIFIC: Date]

---

<!-- Add more completed stories following the same format -->

---

## Planned Stories

Stories below are candidates for future epochs. Move to "Completed Stories" when implemented.

---

#### US-XXX: [PROJECT_SPECIFIC: Story Title]

> As a **[PROJECT_SPECIFIC: persona]**, I want **[PROJECT_SPECIFIC: capability]** so that **[PROJECT_SPECIFIC: benefit]**.

**Status:** Planned

**Acceptance Criteria:**
- [ ] [PROJECT_SPECIFIC: Criterion 1]
- [ ] [PROJECT_SPECIFIC: Criterion 2]
- [ ] [PROJECT_SPECIFIC: Criterion 3]

---

<!-- Add more planned stories following the same format -->

---

## Story Template

Use this template when adding new user stories:

```markdown
#### US-XXX: [Short Title]

> As a **[persona]**, I want **[capability]** so that **[benefit]**.

**Implemented in:** [EPOCH-ID or "Planned"]

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Completed:** [Date or "Planned"]
```

---

## Relationship to Epochs

User stories capture the **why** (user need and benefit). Epochs capture the **what** (technical implementation tasks).

| Artifact | Purpose | Location |
|----------|---------|----------|
| User Story | Business/user need | `docs/UserStories.md` |
| Epoch | Implementation scope | `docs/ToDos.md` |
| Task | Technical work item | Nested in epoch YAML |
| Acceptance Criteria | Definition of done | In user story |

**Workflow:**
1. Identify user need -> Create user story
2. Design solution -> Create epoch with tasks
3. Implement -> Work through tasks via `/nextTask` and `/implement`
4. Complete -> Mark epoch complete, update story status

---

## References

- **Task Tracking:** `docs/ToDos.md`
- **Completed Work:** `docs/CompletedTasks.md`
- **User Stories Standard:** [docs/common/user-stories-standard.md]([RELATIVE_PATH]/top-level-gitlab-profile/docs/common/user-stories-standard.md)
