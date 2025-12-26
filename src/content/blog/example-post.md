---
title: "Getting Started with CUDA Programming"
description: "A beginner's guide to GPU programming with CUDA, covering basic concepts and your first kernel"
date: 2025-01-15
tags: ["cuda", "gpu", "tutorial"]
draft: false
---

## Introduction

CUDA (Compute Unified Device Architecture) is NVIDIA's parallel computing
platform that allows developers to harness the power of GPUs for general-purpose
computing.

## Basic Concepts

### Thread Hierarchy

In CUDA, computation is organized in a hierarchy:

- **Threads**: Basic unit of execution
- **Blocks**: Groups of threads
- **Grid**: Collection of blocks

The total number of threads can be calculated as:

$$
\text{Total Threads} = \text{gridDim.x} \times \text{blockDim.x}
$$

### Memory Hierarchy

CUDA has several memory types with different speeds and scopes:

1. **Global Memory**: Slowest, accessible by all threads
2. **Shared Memory**: Fast, shared within a block
3. **Registers**: Fastest, private to each thread

The memory bandwidth utilization can be expressed as:

$$
\text{Utilization} = \frac{\text{Effective Bandwidth}}
{\text{Theoretical Bandwidth}} \times 100\%
$$

## Your First CUDA Kernel

Here's a simple vector addition kernel:

```cuda
__global__ void vectorAdd(float *a, float *b, float *c, int n) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;

    if (idx < n) {
        c[idx] = a[idx] + b[idx];
    }
}
```

### Launching the Kernel

```cuda
int numElements = 1024;
int threadsPerBlock = 256;
int blocksPerGrid = (numElements + threadsPerBlock - 1) / threadsPerBlock;

vectorAdd<<<blocksPerGrid, threadsPerBlock>>>(d_a, d_b, d_c, numElements);
```

## Performance Considerations

The theoretical peak performance of a GPU can be calculated as:

$$
P_{\text{peak}} = \text{Cores} \times \text{Clock Speed} \times
\text{Operations per Clock}
$$

For example, an RTX 4090 with 16,384 CUDA cores at 2.52 GHz:

$$
P_{\text{peak}} = 16384 \times 2.52 \times 2 = 82.6 \text{ TFLOPS}
$$

## Conclusion

CUDA programming opens up massive parallel computing power. Key takeaways:

- Understand the thread hierarchy
- Optimize memory access patterns
- Always check for errors
- Profile your code
