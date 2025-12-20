# Best viewed in GitHub, VS Code (Markdown Preview), or Mermaid Live.

## **Diagram 1: Complete AI Memory Ecosystem**
- [Click here to see the Diagram](https://mermaid.ink/svg/pako:eNp9VFFv2jAQ_iuRH6ZNou2SEijRVAmI16GRliUBtpk9GHINUYmNjLOWVf3vc2xoA2nrJ39399nf3fn8iBY8AeShGbtd8fvFkgppxf6MWWptinkq6Hppdcl4A8IaMAnili7AGtItiD8mqlzjwT5iXcizHwWI7c4LLJmxo-N6JICci60VUEZTyIHJ2olBcBhU9b3sXo609-Hxdg2bSnC5ojgg0ZILeRKDyC0T-WUuzi77XOX0IK1pxhJ-f0QbKtqQs7TGmsBCcmH5VNI53cARbRqQKRd3GUsPbiqEKBONYLPJOKtwdIney83Z53azBkGlYtcTvAkxiZQo2N15FBDiOBzgCSYhSJHB3zfCxiO_G2MyXidUvhHi4373116QDwu6fS2V19reJzifQ5KUhfmg6kDFYlnrO64EBeppriq-SUR2ld-RMUszVi1_WCZ4Iii7O-a_Jsgn3xm_X0GSgtVTfayJ8Xvk41GvP1XfKI67qhKSqmpRS1e_4h1c-_gn-XYdTc8Gk69qNBJ4eEcMJsNhUFOgbGRIRVpqY2mhBqFWlVF4E4xiMhI8X8tdSUCo_CsxV_iaXAHbvZ66ivHAOjm5VENnYBBo2LMPoWNgz9EQG4Q1mEQGTSINw50zNF4j0ZjMXptVcsZWZl4alExjUBttGA8Mrl7l9wzyexrqMh9YyrYYgx6LA9J-Dp5FowZKRZYg75auNtBAuRp1WmL0WDJmSC7VBzVDntomVNzN1E_5pEhryn5zniNPikLRBC_S5fMhhZ4fP6OqtfmzVY1_AqLPCyaR17T1Gch7RA_Is93Wqeu6TdtpNdvOeaflNtAWeY7tnF447Wanc3Hu2p1Os_XUQP_0tfZpq926cD87brPdtktiA0GSqTcYmA9d_-tP_wHddbYO)

```mermaid
flowchart TD
    subgraph A[User Interface Layer]
        UI[User Input/Query]
    end

    subgraph B[Memory Management Layer]
        MM[Memory Manager]
        
        subgraph B1[Memory Types]
            STM[Short-Term Memory<br/>Context Window]
            LTM[Long-Term Memory<br/>Vector Database]
            WM[Working Memory<br/>Current Session]
        end
        
        subgraph B2[Memory Operations]
            STORE[Store Memory]
            RETRIEVE[Retrieve Memory]
            UPDATE[Update Memory]
            DECAY[Memory Decay]
        end
    end

    subgraph C[Embedding & Search Layer]
        E[Embedding Model]
        VS[Vector Search Engine]
        RE[Re-ranking Model]
    end

    subgraph D[Knowledge Base Layer]
        DB[(Vector Database)]
        META[Metadata Store]
        INDEX[HNSW/IVF Index]
    end

    subgraph E[LLM Layer]
        LLM[Large Language Model]
        PROMPT[Prompt Engineering]
        GEN[Generation]
    end

    UI --> MM
    MM --> B1
    MM --> B2
    B2 --> E
    E --> VS
    VS --> RE
    RE --> PROMPT
    PROMPT --> LLM
    LLM --> GEN
    GEN --> UI
    
    E --> DB
    DB --> INDEX
    DB --> META
    STORE --> DB
    RETRIEVE --> VS
```


## **Diagram 2: RAG Pipeline Step-by-Step**

- [Click here to see the Diagram](https://mermaid.ink/svg/pako:eNptU8tu2zAQ_BWC11pG9LZ0CGDZfQSI0bRNeyiVAy2uJSESKVBUa8fxv3ctoq7ghidxd2a4MxSPtFACaEp3jfpdVFwb8rjOJcHVD9tS864iDxXvwWV3soTe1EraAnHI592uqSU8Wfx5LV22VsXQgjRkpZoGijPhiTjOLVl67BH2WK8G-VzLckrzLMJn79stCIFd8hEkaD7SJ0DfAgP2A6WVJndSwP5KLLCYkG3AcMENJ8u-V0U9FQMpcvmWT499BaNr-MWbfz7llc3MZd970OTLAPpg3WUeG3fk4mCKt_4y_-_Y34DropoirLEsYJ8OW10L8qFuDOgrGessC3FGR_PrFLPQtiO2UtKco0bf0G6bwxQUWVDM7u83b4ecxRaywGP6TknM4B1Z1WbE9f8HaP-PkWMjtOUljjN3bl8fNDid6oaGGxCv6DSXdEZLNEnTHW96mNEWdMvPe3o8c3NqKmghpyl-Cq6fc5rLE5I6Ln8q1dLU6AFpWg1ldREZOrxrWNccb7O9VDUOCnqlBmloGoSjBk2PdE9TN4zmYRgGrhcFsecnEXYPNPVcb77w4iBJFn7oJkkQnWb0ZTzWnUdxtAhvsBph48abURA1XujGPqLxLZ3-AJVQ_mk)

```mermaid
flowchart TD
    subgraph Phase1[Ingestion Phase - Offline]
        A1[Document Collection] --> A2[Text Chunking]
        A2 --> A3[Embedding Generation]
        A3 --> A4[Vector Indexing]
        A4 --> A5[Metadata Association]
    end

    subgraph Phase2[Retrieval Phase - Online]
        B1[User Query] --> B2[Query Embedding]
        B2 --> B3[Vector Search]
        B3 --> B4[Hybrid Filtering]
        B4 --> B5[Re-ranking]
        B5 --> B6[Context Assembly]
        B6 --> B7[LLM Generation]
        B7 --> B8[Response + Citations]
    end

    Phase1 --> Phase2
    A5 -.->|Pre-populated| B3
```

## **Diagram 3: Memory Storage & Retrieval Architecture**

- [Click here to see the Diagram](https://mermaid.ink/svg/pako:eNqFVdtymzAQ_RWNnp1MIbYT89AZ24CTyfgSoH6o3AcFNrYakBghcmkm_94Fik0ct9WLrd2js0d7EW80VglQhz6k6jnecW1I5G4kwVWU91vN8x25kXlp2BwypV-bzY8GUa3pcrFmUyWfQBfcCCXJtSgMIjsYfzyNQnYr1XMKyRaIz2NTdPyrwPPZtwI0WWl4AA0yhq7fW3sLJPByUahExMR7ArknAJls5JHilVbIUAi5bWUfLB3eaHnrLVikHkGKX7X4btD5xHOZl91DkuAxMgMJ-hi0WAZztlA64-kJhkVwM71GBYYn3HDiSS3iXYba_yE9xNzxLbS6_2w7rHvk2p2wNcQIIC7S3_OiC6vW2mpp9tcojiE2C0UmUq6FqYqbwEsHUQtsNyckzL1ofLjfX1TMLRaJDArDs_w4_Nxm47gqDJmqUppP7gt2k-VKG44dQcJYafgE6bMQMi4N9kXEP9zvf-pnwXh13WZoVpmOuGcW1jaBwiFt8xvIjgXMbOZhUyMogLRugWIn8pM6TtU7AKMFPPG0FbI3dBju2F0JOFLk7OwrufOa3aGoXaRXY9Zh2xqd6obAddy94zqswYHPUDqGrJLsi9SA_kga-DUuclkEVTl4SlyIeXfEI7eGjCdtPSdKFd13YjypAX7IfCGRoCrmxyh-oyZarnAk87PbJukCTgx6_QjV6MNcN57Dvnb_GZ_Gt8_sZxcGrY3L0lRvHb5nBl4MxvmJWWymmvboVouEOg88LaBHM8Cpr_b0reLYULODDDbUwb8J148bupHveCjn8rtSGXWMLvGYVuV2tycpc5wccAXHZsj2VnwAE9D1RFCnP6o5qPNGX6hjDYbng8Ggb9nD_qV9MRoOevSVOrZln1_Zl_3R6OpiYI1G_eF7j_6qw1rnw8vh1eALWofowN8ehUTg7efNy19_AN5_AxgH1iw)

```mermaid
flowchart TD
    subgraph Input[Memory Input]
        CONV[Conversation History]
        FACTS[Knowledge Facts]
        PREF[User Preferences]
        EVENTS[Episodic Events]
    end

    subgraph Processing[Memory Processing]
        TOKEN[Tokenization]
        EMBED[Embedding Generation]
        NORM[Normalization]
        ENRICH[Metadata Enrichment]
    end

    subgraph Storage[Memory Storage]
        subgraph VDB[Vector Database]
            V1[Memory Embeddings]
            V2[Similarity Index]
        end
        
        subgraph META[Metadata Database]
            M1[Timestamps]
            M2[Access Counts]
            M3[Importance Scores]
            M4[Semantic Tags]
        end
        
        subgraph GRAPH[Memory Graph]
            G1[Nodes: Memory Items]
            G2[Edges: Relationships]
        end
    end

    subgraph Retrieval[Memory Retrieval]
        Q[Query] --> QE[Query Embedding]
        QE --> VS[Vector Similarity Search]
        VS --> RF[Relevance Filtering]
        RF --> TD[Temporal Decay]
        TD --> AB[Access Boost]
        AB --> FS[Final Scoring]
        FS --> TOP[Top-K Memories]
    end

    Input --> Processing
    Processing --> Storage
    Retrieval --> Storage
    TOP --> Output[Context Injection]
```

## **Diagram 4: Embedding Model Architecture**

- [Click here to see the Diagram](https://mermaid.ink/img/pako:eNqNVFFv2jAQ_iuWH_YErDEkQDRVgiaoaEBQCWVamCqDDWQkNnIcUVr1v89xoKQBtfNLfPfd3Xeffc4rXHJCoQ1XEd8vN1hI4DtzBtRK0sVa4N0G9NkulQN8oCIHsuW7v_zgAe-BT59lHvGngHo_A59vKQtfqPjof-o7OQT6TlKAxt4kGPMklCFnwGWqq5CtTwGUkTkrdeXGC0qyoFJnMzeYcUHO-AcWt0ByLWDiBhO6jimTBfzHQny_7boPPuAsOhSjp8NgksYxzgp-0qsvMEtWXMRUdCO-3CbnEueYrhEU4oAOBEaBLVvD-44RDNNIhtV7ignoSKl6PbOfVsdxjKBDCPgGRqpeCe31RkbQo5SAHhd7LMhlNrqerdWdjKsq0BUVqFarjS6VoP9UUv9UCfpCSeMLJdcuzEvl5cyPPW-gxodHaiaAxgrlHHekZsehLKFgLPhfuixpGXkPwydv6gcDpFvBUfiCSzGP7l2QU4NHVYCLy5nKHh6oVm-zt3T6qjd1BPVeu2du7lLvStvjoz1ztakm94iX7EnJPnqnw5ysaxyZusbRgU4OlPOoQypmZrYG9AHp3ekktKEkwwpci5BAe4WjhFagmpsYZzZ8zWrModzQmM6hrbYEi-0cztmbStph9pvzGNpSpCpN8HS9eS-S7giW1AmxutD43SvUSVJxx1MmoW3WdQ1ov8JnaBumVTNNs2Egq9FE9bZlVuAB2shAtRZqNtrtVt002u2G9VaBL5rWqFlNq2XeKK-lAPWtQEpCdW3D_J-qf61v_wBBuIs0?type=png)

```mermaid
flowchart TD
    subgraph InputLayer
        TEXT[Raw Text Input]
        TOK[Tokenizer]
        TOK_ID[Token IDs]
        POS[Position Encodings]
    end

    subgraph EmbeddingLayer
        WE[Word Embeddings]
        PE[Position Embeddings]
        SE[Segment Embeddings<br/>BERT only]
        SUM[Summation]
    end

    subgraph TransformerBlocks
        subgraph TB1[Transformer Block 1]
            MHA1[Multi-Head Attention]
            ADD1[Add & Norm]
            FFN1[Feed Forward]
            ADD2[Add & Norm]
        end
        
        subgraph TB2[Transformer Block 2...N]
            MHA2[Multi-Head Attention]
            ADD3[Add & Norm]
            FFN2[Feed Forward]
            ADD4[Add & Norm]
        end
    end

    subgraph OutputLayer
        POOL[Pooling Layer]
        DENSE[Dense Projection]
        NORM_OUT[L2 Normalization]
        VEC[Output Vector]
    end

    TEXT --> TOK --> TOK_ID
    TOK_ID --> WE
    POS --> PE
    WE --> SUM
    PE --> SUM
    SE --> SUM
    
    SUM --> TB1
    TB1 --> TB2
    TB2 --> POOL
    
    POOL --> DENSE --> NORM_OUT --> VEC
```

## **Diagram 5: Vector Database Architecture**

- [Click here to see the Diagram](https://mermaid.ink/svg/pako:eNp9VG2PojAQ_iukn9WcruDKh0uQ1dUETwSzJlc3ly7MYnPYmlLu9iX737ct6MFqrgkzMM90-sxLeUcJTwG56Dnnf5M9EdIKoh2z1CrKp0yQ497ycwpM4kpZ3vGY04RIylnxWHnq5YVhH2_hSeNt8wAv-RPN4RK5wV64sGIQf2gCNQQs3bEvBJSX8QzIK4hGiGgab7AW2qNhv49CH2dKXNi9cL4O8L2Oug4a6LVT1yWIV2ykFQqeQFFQljXCrcMTSkTRIrZe1cjqKOmBvrVA3_Pn0xr3SbL_X-YLlsILNvIi-6aTql_xD9Fr_iPeYi0sk-1jG108zLB6qvhfsHCNVbppmUhVAsIkfTPN_uI1C7wNnuVEXsQweZw-rtBdgiQpkaQdb7IRAHjS1eoqrUmwWi3xJOf8YM1oLlu1OJ95rYix5IJkgGttTVlGGTR2P0z9zSqK8QMkyuXk33BYTjcePvG-gm-9AG8FldD19kBSK-DZZVPr-9PtfteDZ7QZggqt5kEbTfKVsWq8NtZnVuaL-1kWqhy41mpIra6ZPM5I3mAZz73oDsfqkqftQY6mYbDwPRzB-Wo30GDl3f2aqAwDrlKbkJyw5Fz8c-EreSpxt6c413xQB2WCpsh9JnkBHXQAcSD6G73rTTsk93CAHXLVa0rE7x3asQ-16UjYT9Vs5EpRqm2Cl9n-HKQ8qlbAHSWqBIezVSg6IHxeMolce2RiIPcdvSC3bzs927aH_YEzHA1uxo7dQa_IHfQHvdvBaDge397Y_fF46Hx00Js5tt9zRs6t_U1ZHQUo3UGQUpXhsvplmj_nxyfNTI_-)

```mermaid
flowchart LR
    subgraph Client[Client Applications]
        APP1[Web App]
        APP2[Mobile App]
        APP3[API Service]
    end

    subgraph API[API Layer]
        REST[REST API]
        GRPC[gRPC API]
        GRAPHQL[GraphQL API]
    end

    subgraph Query[Query Processing]
        QP[Query Parser]
        QO[Query Optimizer]
        CACHE[Query Cache]
    end

    subgraph Index[Index Layer]
        subgraph Indices
            HNSW[HNSW Graph]
            IVF[IVF Index]
            PQ[Product Quantization]
            FLAT[Flat Index]
        end
        
        subgraph Metadata
            BTree[B-Tree Index]
            BLOOM[Bloom Filter]
        end
    end

    subgraph Storage[Storage Engine]
        VECTORS[Vector Storage]
        META[Metadata Storage]
        WAL[Write-Ahead Log]
    end

    Client --> API --> Query
    Query --> Index
    Index --> Storage
    
    subgraph Cluster[Clustering - Optional]
        SHARD[Sharding]
        REPLICA[Replication]
        LOAD_BAL[Load Balancer]
    end
    
    Storage -.-> Cluster
```

## **Diagram 6: HNSW (Hierarchical Navigable Small World) Index**

- [Click here to see the Diagram](https://kroki.io/mermaid/svg/eNqVU7Fu2zAU3P0Vb0wGoyVlyR6KAIGNJIPtoWzRgehAiUxERCYFirLrvy9F0rEsWynK5VG6e093R-q10oeiZMbCj9UE3Gra_M2wuoSlVo01bWGlVvRlS35dvPntyd1aIkpsN-AgbQliV9sj-Ak9CqZP2oBgRQl7UVi33_fQJA5gFqyuoWJHYWDdI8zok1QclGBGNNZV-Vbm2jQ9SkqXRjAroNBKCS-x-ZabLw879gc2ULuJfm6vJaMbvRfA9UGBVuIKn9PvonYzoVVWVlHW1x5hQR85d5KBVREOn_RB1EbnLJeVdHHUoUkoPpmEyGA6fXCxhJKEMgslDSULZR7KYnJ5OMRFUZThWML-rIugG3l6YUJZ49RoqWyPjumzEYIfofGD4FUH9jDuXkvyeXRkRn82AvKuu2CKS-5Oxs9kDdwWkf4jbJI5gm2NgvfTPYgiL-7CR8QkRExCxCRETELEJERMsmGo_nK3RoRcny9fnrV8NKwTuvZC3XggNTNNj9WtbYLu7raai_t798mpe8an5wEPRzy5wjtLp_0NCThKcANgI7hsdwMJeCABj0jAUQJORvAk4rMRfBbx9H8toGjBHRmshLoKEQ0coBEHKDpAIw5QdIBGHKDoAKUjeBrxbATPIj4fwecRX4zgi4ijz5Nbdz5g5X6-AzMcKqneG3-j1_jMwWMcdPpR_gJFY4QR)

```mermaid
flowchart TD
    subgraph Construction[HNSW Construction]
        C1[Start with empty graph]
        C2[For each vector v]
        C3[Start at top layer L]
        C4[Find nearest neighbors]
        C5[Create connections<br/>max M per layer]
        C6[Move down one layer]
        C7[Repeat until layer 0]
        C8[Add to all layers<br/>with probability p]
    end

    C1 --> C2 --> C3 --> C4 --> C5 --> C6 --> C7 --> C8

    subgraph Search[HNSW Search]
        S1[Start at top layer<br/>entry point]
        S2[Greedy search for<br/>nearest neighbor]
        S3[Move down one layer]
        S4[Use best candidate<br/>as entry point]
        S5[Repeat until layer 0]
        S6[Return k nearest<br/>neighbors]
    end

    S1 --> S2 --> S3 --> S4 --> S5 --> S6

    subgraph Structure[HNSW Graph Structure]
        subgraph L3[Layer 3 - Sparse]
            N31((Node)) --- N32((Node))
            N32 --- N33((Node))
        end
        
        subgraph L2[Layer 2 - Medium]
            N21((Node)) --- N22((Node))
            N22 --- N23((Node))
            N23 --- N24((Node))
            N24 --- N25((Node))
        end
        
        subgraph L1[Layer 1 - Dense]
            N11((Node)) --- N12((Node))
            N12 --- N13((Node))
            N13 --- N14((Node))
            N14 --- N15((Node))
            N15 --- N16((Node))
            N16 --- N17((Node))
            N17 --- N18((Node))
            N18 --- N11
        end
        
        L3 -- Downward links --> L2
        L2 -- Downward links --> L1
    end
```

## **Diagram 7: Memory Retrieval & Scoring Algorithm**

- [Click here to see the Diagram](https://mermaid.ink/svg/pako:eNptlE1O20AUgK8ymhVVE4pDbIgXlQKECkFKiAOVGrMY7IftYs-YmXFLirhA1QqkIhaoUruohKqq-0q9A4fgAu0R-sYOkCC8iOL3vu_N3xsf00CEQF26n4p3QcykJoMVnxN8tob_vl59I9sKJNkqQI52Sb3-nGx1MH7-ibwADpJpqHKkk-1BGCY82h3bnZLe8ZD-_JHsQKCFJF6SJSmTiR4RD5gM4jFd_e54pdO3jHNJ-qBlAm-BLDMeJqEZqwuZwJia0lSxF0mWx8QLMMkjYvQz0i1SndRXWTVwlRp75vGsoU89yBjXSTAxMd_ngVAzh7XsiU8n-QbyA8hyIVlKViBgBoWjfKZ-_ef6XD-g55FuBwEoRVYlHBbAA8OnIpqxngai4A-FJgprprpmPIBywoBCgdtfZ0olEYdw2rDR6ENgKpMlIZRG3HqG5e9mM7nacmu97e7w5vLi7-9T8gqSKNYQEq_IppZ5C04u5pFY85GYPR0DHk6eU388h-ooJjNoVCfffrluDu8D6TN-8PC0TbbEVtc2Bp0-gpc_STvP0xEZxBJULNJwjFZECQ82e8ObX2fYbyn2IBmIvL7-eB8hWRptz-t0lzZMn1_9IG2lINtLsQsF13Ckx8otVBq9_ma3NxjefDk1O7vG35iREq4F6UmR5bdOhZXGxkYXy3-_uL9GGMGOV7ngCpCnNRrJJKTuPksV1GgGMmPmnR6bYj7VMWTgUxf_hkwe-NTnJyjljL8WIqOulgVqUhRRfFekyM0tWkkY3pd7BI8J5LJpSeo6dlmCusf0iLqW7czatt20Gk5zoTHfMtkRdRtWY3axsdBstRbnbavVajonNfq-HNWadRacRXsOow4m5iynRiFM8Ap2q-9M-bk5-Q9hoGrr)

```mermaid
flowchart TD
    Q[🧠 User Query] --> QE[🔍 Generate Query Embedding]
    QE --> VS[📌 Vector Similarity Search]
    
    VS --> R1[📚 Retrieve Candidate Memories]
    
    subgraph Scoring [📐 Multi-Factor Scoring]
        S1["Semantic Similarity\ncos(q,m)"]
        S2["Temporal Decay\nexp(-λΔt)"]
        S3["Access Frequency\nlog(1+count)"]
        S4["Importance Score\nuser-assigned"]
        S5["Recency Boost\n1/(1+Δt)"]

        S1 --> SUM[⚖️ Weighted Sum]
        S2 --> SUM
        S3 --> SUM
        S4 --> SUM
        S5 --> SUM
    end
    
    R1 --> Scoring
    
    SUM --> RANK[📊 Rank Memories]
    RANK --> FILTER[🚫 Apply Threshold]
    FILTER --> TOP[⭐ Select Top-K Memories]
    
    TOP --> ASSEMBLE[🧩 Assemble Context]
    ASSEMBLE --> PROMPT[✏️ Inject into Prompt]
    PROMPT --> LLM[🤖 Generate LLM Response]
```


## **Diagram 8: Complete Conversation Memory System**

- [Click here to see the Diagram](https://mermaid.ink/svg/pako:eNqVVV1zokAQ_Ctb-6ypAz8SebgqTzGxTqMHJHe5NQ8oo1LCrrVAEs_4329YImDEh1BlFW5P7_bM9gx7uhAeUIMuA_G6WLsyJk5_xgk-UTJfSXe7Jj3BX0BGbuwLPsCwDE6fB9u02EMEkowhitwVPJN6_Tvpjbq2PRw8sV7gRpG_3JEhj4HHzwWzeDsGK-bw3jHvnX0WTpzdFg5VnCwsZbwP3EWcuAH5lYDcvZNBt-cwC2LpwwuQFIyeK3lTzEjwgjg1LbsgHtELXCkW4CWyxLYmvRL7A4cLZ5uhSGtZ0M3xpKQ6hyvrlWaoamWZjjU0H7ujAkuTuIihxEtYen4VBtzLXj45Ig9jYwiF3JEP7ZiRyj0qJ25pTKVJzLetyyPMrAzqzAzn4Hk-X5Fb4CCVzcoRDfYIi1hIYoMrF-sy1GR3u7n0PTLwgxgk7lFGW1jSunT5pli_lNAYK2A9HbOx8bTUzMVeeWD_h8ZSV5EstBSi7kZjWQ4B-cnFawDeyS4qRGd9Ebo-PzOnQtNkpb_0F6oMxBaJXJzYKM_g1BUlgTrLvV0pcqqxqYQlSOCnWytQZ3d-FFewGljNQKmK1v72a5IarNQy1aLQJfbGD4IzQeiQO_FajwW5TXzvXDD647eQm3R-fU1UkxV9WKnJREk4hvzwdHQpSC-R7diNz3SZDeYIns6CqlLn6j4ZMm8s1Y2ZK6uQ3gSnyR-HdaMIwnkA6YyO4e0o8wNWoaPRmOHvvLnSxazn7enk3jbxfqMt3u7RscdzM1SF2s7EMlnaHkDQwSdVU1hJNq3RFbYmNZZuEEGNhiDR9vif7lPCjMZrCGFGDXz1XLmZ0Rk_IAlnxF8hQmrEMkGaFMlqnW-SbD2sdd938RLDfBXL64HsiYTH1Gh31B7U2NM3amit9lWr1Wpqert5rTc67VaN7qiha_rVjX7d7HRuGi2t02m2DzX6Tx2rXbWv2zetb7jaRuCbXqPg-ZjyOPtQqu_l4T9VlBrW)

```mermaid
flowchart TD
    subgraph ConversationFlow
        USER[User Message] --> CLASSIFY[Classify Intent]
        
        CLASSIFY --> INTENT{Intent Type}
        
        INTENT -->|Factual Query| FACT[Retrieve Facts]
        INTENT -->|Personal Query| PERS[Retrieve Personal]
        INTENT -->|Procedural Query| PROC[Retrieve Procedures]
        INTENT -->|Emotional Query| EMOT[Retrieve Emotional]
        
        FACT --> RETRIEVAL
        PERS --> RETRIEVAL
        PROC --> RETRIEVAL
        EMOT --> RETRIEVAL
    end
    
    subgraph RETRIEVAL[Memory Retrieval Process]
        R1[Query Expansion]
        R2[Embedding Generation]
        R3[Vector Search]
        R4[Hybrid Filtering]
        R5[Re-ranking]
    end
    
    subgraph MEMORY[Memory Storage]
        subgraph DB1[Fact Memory]
            F1[General Knowledge]
            F2[Domain Facts]
            F3[Verification Sources]
        end
        
        subgraph DB2[Personal Memory]
            P1[Preferences]
            P2[History]
            P3[Relationships]
        end
        
        subgraph DB3[Procedural Memory]
            PR1[Skills]
            PR2[How-to Guides]
            PR3[Workflows]
        end
        
        subgraph DB4[Emotional Memory]
            E1[Sentiment]
            E2[Emotional States]
            E3[Tone Preferences]
        end
    end
    
    RETRIEVAL --> MEMORY
    RETRIEVAL --> CONTEXT[Assemble Context]
    CONTEXT --> LLM[LLM Generation]
    LLM --> RESPONSE[Response]
    
    RESPONSE --> STORE[Store in Memory]
    STORE --> MEMORY
```

## **Diagram 9: Vector Similarity Metrics Comparison**

- [Click here to see the Diagram](https://mermaid.ink/svg/pako:eNqNlFFv2jAQx7-K5WdaNSEJJBKTUEK3VqNEQF9m9mCSA9wlNnNsNlr1u8_gkAbWavPLOf7_fPZd7vyCM5EDjvCqEL-yDZUKzZMFX3BkRqWXa0m3GzQGJVlW2dXDiCezu4cRiUXFOKAZK1lBJVP772_I6DH-epeMhg9kpLOC5UA5SlilKM-ghSWTeTqdJI_xnCRCoVSKXGeqBYyHD1-G87nxM6Z8Q5V638_9MI6H04Tc0yyjMv_7TsBzO7mI7VbIUhe0FdytQzIb2ADl5k4525nr52i5R9zAVevUW5dAE90ASWHwSpdIrFD1U1MJZ3CXHNxtbYgGr8l64Qz1SNlE24B0WYlCK0A7Wuhz1z55qgMfIMYVyAoyxQRHYgcSaW6m_8iDyfwWpGLQykTqkCnla4hQybiukDA5UeJgWmen7gl6BikOOuMrxs-rIe2eoFp8J4jU-x9H_iV0fpsWGZAhXxeAlrQyf6881nDbU4-c6uhDpE9MWp7qVH4EheSzZPmHsnNDZqDeky9-hW0qdHX1yZTg0aS1CSzQtJRlXCvWpmeZt36yUNeqtelbqOkpy3hWrE1ombqhLOFbqTbODe7gtYkZRytaVNDBJciSHr7xy2H3AqsNlLDAkZnmVP5Y4AV_NZu2lH8TosSRktpsk0KvN40Tvc2pgoRRU5BlsypNlkDGQnOFo1736ANHL_g3jhw_uPZ933PcwOu53TDwO3iPI9dxr_tuzwvDftd3wtALXjv4-Xiscx30gr5_Y1YDIxjbwZAzJeTYPoPH1_D1D2YmgeI)

```mermaid
flowchart TD

    subgraph Metrics
        COSINE[Cosine Similarity]
        EUCLIDEAN[Euclidean Distance]
        DOTPRODUCT[Dot Product]
        MANHATTAN[Manhattan Distance]
        JACCARD[Jaccard Similarity]
    end
    
    subgraph Formulas
        F1[cosine = dot divided by norms]
        F2[euclidean = root sum of squares]
        F3[dot product = sum of products]
        F4[manhattan = sum of absolute values]
        F5[jaccard = intersection over union]
    end
    
    subgraph Properties
        P1[Range: minus one to one]
        P2[Range: zero to infinity]
        P3[Range: infinite values]
        P4[Range: zero to infinity]
        P5[Range: zero to one]
        
        P6[Angle based metric]
        P7[Distance based metric]
        P8[Projection based metric]
        P9[Grid based metric]
        P10[Set based metric]
    end
    
    COSINE --> F1 --> P1 --> P6
    EUCLIDEAN --> F2 --> P2 --> P7
    DOTPRODUCT --> F3 --> P3 --> P8
    MANHATTAN --> F4 --> P4 --> P9
    JACCARD --> F5 --> P5 --> P10
```


## **Diagram 10: Embedding Space Geometry**

- [Click here to see the Diagram](https://mermaid.ink/svg/pako:eNqFlF1v2jAUhv-K5dtC1JgkQKROoqETSHRUbbWLmWoyyVliFduZ47SjiP8-hzAIVWC-iX3e8_HEPvYGxyoBHOJUszxDz-OFRHYU5bI2zNT7mIvaWI3Z2KV3rOCrNfrOi5Kt-AdbruCl6UHojAtuIEERy1nMzfpE7tEHpTR6gpxpZriSJ6pH75m0edFUGtC5BtP0AZnUk0-YE55mJ5wTy_lNmXOQEwtZxbQRTizhI4-zdsKJJbwToFOQBkWrsrCUxX_o9m7HJJFLR5IL-5d7qVEgIvQZ4qxN6dGnmIOMoU2ssFQF2yIeZ0cm9-fUgCiOUg02oolK0RvERmnHcV4-67c0ZuaCHtFM6QJaPQ77c46JtDKREY2VyEv7T-cLk1uaZ0rCBY-ImqoNzGW2c4c4z6FuhgbevGoyLaoG-1e4kXJO6ChJ9vaiKdiDLJdGs9i0qR4dvdlaKbSIDTefvnKZoi4STKIr9K6q7w36XQI0G3Ye0AemeWEdv2pWNc8VmhpmL_ANelQC2nt3f6FQt_vltH33i51w3BLcsQ8IT3D4i60K6GB7QQSr1nhThS2wyUDAAod2mjD9usALubVBOZM_lBI4NLq0YVqVaXZIUuYJMzDmzB6AOFi1JQUdqVIaHPb7uxw43OA_OHT9wPF933NJ4PVJbxj4HbzGIXGJMyB9bzgc9Hx3OPSCbQd_7Mq6TtAPBv61tQZWuCYdDAm3e35fv4q7x3H7F4pRgeA)

```mermaid
graph TD
    subgraph LowDim
        LD1[Easily Visualizable]
        LD2[Limited Capacity]
        LD3[Poor Separation]
        LD4[Manual Interpretation]
    end
    
    subgraph HighDim
        HD1[Not Visualizable]
        HD2[High Capacity]
        HD3[Rich Separation]
        HD4[Emergent Clusters]
    end
    
    subgraph Cluster
        C1[Animal Cluster]
        C2[Tech Cluster]
        C3[Science Cluster]
        C4[Emotion Cluster]
        
        subgraph C1_Items
            C1A[dog vector...]
            C1B[cat vector...]
            C1C[horse vector...]
        end
        
        subgraph C2_Items
            C2A[computer vector...]
            C2B[phone vector...]
            C2C[tablet vector...]
        end
    end
    
    subgraph Operations
        O1[Normalize vector]
        O2[Add vectors]
        O3[Subtract vectors]
        O4[Average vectors]
        
        O5[king - man + woman = queen]
        O6[Paris - France + Italy = Rome]
    end
    
    HighDim --> Cluster
    Cluster --> Operations
```


## **Diagram 11: Memory Decay & Forgetting Mechanism**

- [Click here to see the Diagram](https://mermaid.ink/svg/pako:eNp9VE1v2zAM_SuCzmlQfzYxsAFBsmIFFgxId5qzgyLTtjBbMiQ5a1b0v4-2k1jugvpiiXokHx8pvVKuMqAJzSv1h5dMW_Jjs5cEP9MeCs2akjxJYQWrBmv3bb10C7XSJ7LWwCxkxHCl4ZM3v__loPz0h6jhitGAoAwyFxKkT3WjtGWSA2HGiEJOAWG64hyMIWvVSksu8UFme_mO5gY4O42uGy_tLclAjmTAkYgBQ9QRNLFIzUm08dMdsiQVqw8ZI1xJq1VliGlgQmgTDEUZ0THuIlqhJGnNFBWmX1mVk0rkQA6YdFBIyOID_jsQMleaQw3SjrF23kWCg1LGmqEcJ9kOqbuuxFgNsrCliwkuQZD3WQbeKepiwvQbM5acgW2TdW37gPCj0gVYi1WNQR699LmX25YaTKmqru-1OrLKyfTop2vWMC7s6azODUyQrpXMK8HtrdMw3TLZsorkVxIfMF1pXoojjP4rD6PXDVLssj9bpVnharryccItQwUY-S6rk3sUoNyMW3EcWs8qvDm3dDpfG3J399mdzX7ZG280fNrIDvRe5HHfH08q-2-gOJJzGrzG5qDsvd4NWNHxdwdg7acrYxQXQ2VWi6IAbSaQvi0WXrqujCpMIGH6pVadFYs3rBKAV8WVZ6R6Zk_u5r0cI91hfbFPZKIzWmiR0SRnlYEZrUHXrNvT1853T22JyD1NcJkx_XtP9_INnRomfypV08TqFt20aovyGmQY9o1gqFx9teI1ykD3Lw9NFl4fgyav9IUmXhTPoygKPT8OH_xgGUczeqKJ7_nzhf8QLpeLIPKWyzB-m9G_fVpvHj_Ei-gerTEe4H9GIRM4etvhBe4f4rd_a5m_Hw)

```mermaid
flowchart TD
    subgraph Initial
        M1[Memory Created score=1.0]
        M2[Time Created recorded]
        M3[Importance assigned]
        M4[Access Count 0]
    end

    subgraph Decay
        D1[Decay: score decreases over time]
        D2[Rate lambda controls speed]
        D3[Time since creation used]
        D4[Half life based scoring]
    end

    subgraph Reinforcement
        R1[Access boosts score]
        R2[Reinforcement strength]
        R3[Access increases count]
        R4[Last Access updated]
    end

    subgraph Forgetting
        F1[Score threshold removal]
        F2[Capacity based removal]
        F3[Conflict removal]
        F4[Manual forgetting]
    end

    subgraph Archive
        A1[Compressed Storage]
        A2[Metadata Only]
        A3[Reactivation allowed]
    end

    Initial --> Decay
    Decay --> Reinforcement
    Reinforcement --> Forgetting
    Forgetting --> Archive
    
    subgraph Recall
        RC1[Spaced repetition]
        RC2[Association triggers]
        RC3[Context reactivation]
        RC4[Emotional salience]
    end
    
    Archive -.-> Recall
    Recall -.-> Reinforcement
```

## **Diagram 12: Complete System Data Flow**

- [Click here to see the Diagram](https://kroki.io/mermaid/svg/eNqFVMtu2zAQvPcreAmQHlxAlnwN4FhKY0B-51GAyIGWNrJgiRRIKrGLfHxJ6kHaFVoBtswd7-xwuMv3gn0mB8IlirffkHpEvc84qQ5ox2qegMAhkaRbvJm_6Gfn4ZAldQlUutExnjH6AVwQmTPqIj6eruduIMDPAjia06qWTniCo5METkmBdOU9EV1ZoKl5X8qc0wyELtYI7ZeWcu7h2aGmx5xmTlApLYDQy6CPl4yXpMh_kyuOAC9AklSXUPo4SSw-rCsq95Cmih73v9A6r6DIKVjeyMNP7Aj0r4LR2MlbsBQKB_PxCySScfQTKPDrzGBoE8Mid4qEZNDRtUvL9RLe49sW7E7ju-PKMox-4cfl7lX5nsLJIovoaYpve8vCeydrNp09RnhGkgOgmJyB_0vhpgZ-xuYbrTlTPSgujmzjteAWEsg_IHWgcQtNVTOdRe4038Z33B0ycRP0ngDhycFBJngLoi4kmmYZh-y_HsfxAquPckhCdl0n9vTASDgpOiGg3BdnBxxjteWykiiimWob4Bdbj33DOyQ_DrTISk0goAfdDFL2qcMqV7VUc4ibFwpVm6opdrSsvJ7RCaohyuX1qK98vaf3PAWaANoljLsXx0pPUsnUsTxXqjcGh7u9bdBodGcH2iD9ymD9GRrMnqjG2l62pE0vXEM2qrw0Ee2pXjdW2PzWGgNNzN31ZsGbG_QAkO5JckQxY1WTMUGjH6O7ryV8mun56jbWoEGDNjagxpSvTtwfEv-blw)

```mermaid
flowchart LR
    subgraph Sources[Data Sources]
        S1[Documents]
        S2[Conversations]
        S3[APIs]
        S4[User Input]
        S5[External Databases]
    end
    
    subgraph Ingestion[Data Ingestion]
        I1[Chunking]
        I2[Cleaning]
        I3[Normalization]
        I4[Metadata Extraction]
    end
    
    subgraph Embedding[Embedding Pipeline]
        E1[Tokenization]
        E2[Embedding Model]
        E3[Vector Generation]
        E4[Normalization]
    end
    
    subgraph Storage[Vector Storage]
        VDB[(Vector Database)]
        INDEX[HNSW Index]
        META[(Metadata DB)]
        CACHE[Cache Layer]
    end
    
    subgraph Query[Query Processing]
        Q1[Query Received]
        Q2[Query Analysis]
        Q3[Embedding Generation]
        Q4[Vector Search]
        Q5[Result Aggregation]
    end
    
    subgraph LLM[LLM Integration]
        L1[Context Assembly]
        L2[Prompt Engineering]
        L3[LLM Generation]
        L4[Response Formatting]
    end
    
    subgraph Output[Output Delivery]
        O1[Response]
        O2[Citations]
        O3[Confidence Scores]
        O4[Memory Updates]
    end
    
    Sources --> Ingestion
    Ingestion --> Embedding
    Embedding --> Storage
    
    Query --> Storage
    Query --> LLM
    LLM --> Output
    
    Output --> O5[User]
    
    %% Feedback Loop
    O5 -.->|New Data| Sources
    O4 -.->|Update Memory| Storage
```

---
