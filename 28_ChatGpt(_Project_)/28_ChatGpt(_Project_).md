

# 📌 **ASCII Flow Diagram – NORMAL FLOW**

```
NORMAL FLOW:
────────────

1. User message saved in DB
        │
2. Generate vector for message
        │
3. Vector search in Pinecone (retrieve related memory)
        │
4. Save new vector memory in Pinecone
        │
5. Get latest chat history from DB
        │
6. Generate response using LTM + STM
        │
7. Save generated response in DB
        │
8. Convert generated message into vector
        │
9. Save AI response vector to Pinecone
        │
10. Emit/send response to frontend
```

---

# ⚡ **ASCII Flow Diagram – OPTIMIZED FLOW**

```
OPTIMIZED FLOW:
───────────────
// Run independent steps in parallel

1. (Parallel)
   ├── User message saved in DB
   ├── Generate message vector
   └── Save vector memory in Pinecone
        │
2. (Parallel)
   ├── Query vector memory (Pinecone)
   └── Get chat history from DB
        │
3. Generate response using LTM + STM
        │
4. Emit/send response to frontend
        │
5. (Parallel)
   ├── Save AI response in DB
   ├── Convert response to vector
   └── Save AI vector memory in Pinecone
```

---
