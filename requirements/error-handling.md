# Error Handling Requirements

All errors follow standard format:

```json
{
  "error": "Human readable message",
  "code": "MACHINE_READABLE_CODE",
  "details": {} // Optional additional context
}
```

Related Tasks: [TASK: 03-closet-crud-image-management#3.2], [TASK: 04-social-features-privacy#1.1]