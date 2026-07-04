---
title: journal-advisory
blurb: "A retrieval-augmented (RAG) TUI over an Obsidian notes corpus, using sentence-transformers + ChromaDB with hybrid semantic + recency-weighted retrieval."
outcome: "Hybrid semantic + recency-weighted retrieval over an Obsidian corpus, in a fast local TUI."
tech: ["Python", "sentence-transformers", "ChromaDB"]
order: 3
---

A retrieval-augmented (RAG) TUI over an Obsidian notes corpus. Retrieval is
hybrid: sentence-transformers embeddings in ChromaDB, combined with
recency-weighted scoring so newer notes surface first.
