---
name: fuzzing-integration
description: Unified fuzzing decision tree for selecting and integrating the right fuzzer. Covers AFL++, libFuzzer, cargo-fuzz selection criteria, harness patterns, coverage integration, and CI setup.
version: 1.0.0
tags: [fuzzing, testing, security, afl, libfuzzer, cargo-fuzz, ci]
triggers: [fuzz, fuzzing, fuzzer, harness, coverage, afl, libfuzzer, security-testing]
---

# Fuzzing Integration

A unified decision framework for selecting, configuring, and integrating fuzzers into your development workflow. This skill helps you choose the right fuzzer, write effective harnesses, and set up continuous fuzzing.

## Overview

Fuzzing is the most effective technique for finding bugs in parsing, deserialization, and data processing code. This skill provides a structured approach to fuzzer selection and integration, covering AFL++, libFuzzer, cargo-fuzz, and property-based testing alternatives.

## When to Use

Invoke this skill when:
- Starting a new fuzzing campaign
- Choosing between fuzzing tools
- Writing fuzzing harnesses
- Integrating fuzzing into CI/CD
- Deciding between fuzzing and property-based testing
- Optimizing fuzzing performance

## Workflow

### Phase 1: Fuzzer Selection Decision Tree

```
START: What language is your target?

C/C++ ──┬── Need multi-core? ──┬── Yes ─→ AFL++
        │                      └── No ──→ libFuzzer (start here, migrate later)
        │
        └── GCC-only project? ────────→ AFL++ (gcc_plugin mode)

Rust ───┬── Using Cargo? ─────────────→ cargo-fuzz
        └── Custom build? ────────────→ AFL++ or LibAFL

Python ─────────────────────────────→ Atheris (libFuzzer-based)

Go ─────────────────────────────────→ go-fuzz or native fuzzing (Go 1.18+)

JavaScript/TypeScript ───────────────→ Property-based testing (fast-check)

Smart Contracts ─┬── Solidity ───────→ Echidna or Foundry fuzz
                 └── Rust (Solana) ──→ cargo-fuzz + Trident
```

### Phase 2: Fuzzer Comparison

| Fuzzer | Language | Multi-Core | Setup | Best For |
|--------|----------|------------|-------|----------|
| **AFL++** | C/C++ | Excellent | Medium | Production fuzzing, parallel campaigns |
| **libFuzzer** | C/C++ | Limited | Easy | Quick prototyping, single-core |
| **cargo-fuzz** | Rust | Limited | Easy | Rust projects using Cargo |
| **LibAFL** | Any | Excellent | Hard | Custom fuzzers, research |
| **Atheris** | Python | Limited | Easy | Python C extensions |
| **Echidna** | Solidity | N/A | Medium | Smart contract invariants |

---

## AFL++ Integration

### When to Choose AFL++

- Multi-core fuzzing required (scales linearly)
- Long-running campaigns (days/weeks)
- Need CMPLOG for magic byte discovery
- Project uses GCC (gcc_plugin mode)

### Quick Setup

```bash
# Install
docker pull aflplusplus/aflplusplus:stable

# Compile with instrumentation
afl-clang-fast++ -fsanitize=fuzzer -O2 harness.cc -o fuzz

# Create seeds
mkdir seeds && echo "test" > seeds/minimal

# Run single core
afl-fuzz -i seeds -o out -- ./fuzz

# Run multi-core (primary + secondaries)
afl-fuzz -M primary -i seeds -o out -- ./fuzz &
afl-fuzz -S secondary1 -i seeds -o out -- ./fuzz &
afl-fuzz -S secondary2 -i seeds -o out -- ./fuzz &
```

### AFL++ Harness Pattern

```cpp
#include <stdint.h>
#include <stddef.h>

// Your target function
void target_function(const uint8_t* data, size_t size);

extern "C" int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {
    // Input validation
    if (size < 4 || size > 10240) return 0;

    // Call target
    target_function(data, size);

    return 0;  // Always return 0
}
```

### AFL++ with Sanitizers

```bash
# AddressSanitizer (memory bugs)
AFL_USE_ASAN=1 afl-clang-fast++ -fsanitize=fuzzer harness.cc -o fuzz_asan

# UndefinedBehaviorSanitizer (UB bugs)
AFL_USE_UBSAN=1 afl-clang-fast++ -fsanitize=fuzzer harness.cc -o fuzz_ubsan

# Strategy: 1 ASan job per 4-8 non-ASan jobs
afl-fuzz -M primary -i seeds -o out -- ./fuzz &
afl-fuzz -S asan -i seeds -o out -- ./fuzz_asan &
```

---

## libFuzzer Integration

### When to Choose libFuzzer

- Quick prototyping and experimentation
- Single-core is sufficient
- Project already uses Clang
- Harness compatibility with AFL++ desired

### Quick Setup

```bash
# Compile
clang++ -fsanitize=fuzzer,address -g -O2 harness.cc target.cc -o fuzz

# Run
mkdir corpus
./fuzz corpus/
```

### libFuzzer with FuzzedDataProvider

```cpp
#include <stdint.h>
#include <stddef.h>
#include <fuzzer/FuzzedDataProvider.h>

extern "C" int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {
    FuzzedDataProvider fuzz(data, size);

    // Extract structured data
    int operation = fuzz.ConsumeIntegralInRange<int>(0, 3);
    std::string key = fuzz.ConsumeRandomLengthString(64);
    std::vector<uint8_t> value = fuzz.ConsumeRemainingBytes<uint8_t>();

    // Use structured data
    switch (operation) {
        case 0: db_insert(key, value); break;
        case 1: db_delete(key); break;
        case 2: db_get(key); break;
        case 3: db_update(key, value); break;
    }

    return 0;
}
```

---

## cargo-fuzz Integration

### When to Choose cargo-fuzz

- Rust project using Cargo (required)
- Quick setup with minimal configuration
- Structure-aware fuzzing with `arbitrary` crate

### Quick Setup

```bash
# Install
cargo install cargo-fuzz
rustup install nightly

# Initialize
cargo fuzz init

# Run
cargo +nightly fuzz run fuzz_target_1
```

### cargo-fuzz Harness Pattern

```rust
#![no_main]

use libfuzzer_sys::fuzz_target;
use arbitrary::Arbitrary;

// Structure-aware fuzzing
#[derive(Debug, Arbitrary)]
struct FuzzInput {
    operation: Operation,
    key: String,
    value: Vec<u8>,
}

#[derive(Debug, Arbitrary)]
enum Operation {
    Insert,
    Delete,
    Get,
    Update,
}

fuzz_target!(|input: FuzzInput| {
    match input.operation {
        Operation::Insert => db_insert(&input.key, &input.value),
        Operation::Delete => db_delete(&input.key),
        Operation::Get => { db_get(&input.key); },
        Operation::Update => db_update(&input.key, &input.value),
    }
});
```

### cargo-fuzz Performance Tips

```bash
# Check if safe Rust only
cargo install cargo-geiger
cargo geiger

# If no unsafe, disable sanitizers for 2x speed
cargo +nightly fuzz run --sanitizer none fuzz_target_1

# Use dictionary for parsers
cargo +nightly fuzz run fuzz_target_1 -- -dict=./format.dict
```

---

## Fuzzing vs Property-Based Testing

### Decision Matrix

| Factor | Fuzzing | Property-Based Testing |
|--------|---------|------------------------|
| **Input format** | Binary/complex | Structured/typed |
| **Bug type** | Crashes, memory | Logic, invariants |
| **Speed** | 1000s exec/sec | 100s exec/sec |
| **Shrinking** | Basic | Excellent |
| **Reproducibility** | File-based | Seed-based |
| **CI Integration** | Dedicated runner | Standard test suite |

### When to Use Fuzzing

- Parsing untrusted input (files, network)
- C/C++ code with potential memory bugs
- Security-critical data processing
- Long-running campaigns (find rare bugs)

### When to Use Property-Based Testing

- Business logic validation
- Roundtrip properties (encode/decode)
- State machine testing
- Need excellent shrinking for debugging
- TypeScript/Python/high-level languages

### Hybrid Approach

```rust
// Use property-based testing for invariants
#[test]
fn roundtrip_property() {
    proptest!(|(data: Vec<u8>)| {
        let encoded = encode(&data);
        let decoded = decode(&encoded)?;
        prop_assert_eq!(data, decoded);
    });
}

// Use fuzzing for crash discovery
fuzz_target!(|data: &[u8]| {
    let _ = parse_untrusted(data);
});
```

---

## Harness Writing Patterns

### Pattern 1: Simple Byte Array

```cpp
extern "C" int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {
    parse_buffer(data, size);
    return 0;
}
```

### Pattern 2: Multiple Functions (Interleaved)

```cpp
extern "C" int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {
    if (size < 1) return 0;

    uint8_t selector = data[0] % 4;
    const uint8_t* payload = data + 1;
    size_t payload_size = size - 1;

    switch (selector) {
        case 0: func_a(payload, payload_size); break;
        case 1: func_b(payload, payload_size); break;
        case 2: func_c(payload, payload_size); break;
        case 3: func_d(payload, payload_size); break;
    }
    return 0;
}
```

### Pattern 3: Stateful Fuzzing

```cpp
// Global state (reset between runs if needed)
static Database* db = nullptr;

extern "C" int LLVMFuzzerInitialize(int *argc, char ***argv) {
    db = new Database();
    return 0;
}

extern "C" int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {
    FuzzedDataProvider fuzz(data, size);

    while (fuzz.remaining_bytes() > 0) {
        int op = fuzz.ConsumeIntegralInRange<int>(0, 2);
        std::string key = fuzz.ConsumeRandomLengthString(32);

        switch (op) {
            case 0: db->insert(key, fuzz.ConsumeRandomLengthString(256)); break;
            case 1: db->get(key); break;
            case 2: db->remove(key); break;
        }
    }

    db->clear();  // Reset for next iteration
    return 0;
}
```

### Pattern 4: Protocol/Grammar-Aware

```cpp
// Define grammar with protobuf
// message.proto
message FuzzMessage {
    enum Type { GET = 0; SET = 1; DELETE = 2; }
    Type type = 1;
    string key = 2;
    bytes value = 3;
}

// Harness with libprotobuf-mutator
DEFINE_PROTO_FUZZER(const FuzzMessage& msg) {
    switch (msg.type()) {
        case FuzzMessage::GET: handle_get(msg.key()); break;
        case FuzzMessage::SET: handle_set(msg.key(), msg.value()); break;
        case FuzzMessage::DELETE: handle_delete(msg.key()); break;
    }
}
```

---

## CI Integration Patterns

### GitHub Actions - Continuous Fuzzing

```yaml
name: Fuzzing

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'  # Daily

jobs:
  fuzz:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y clang llvm

      - name: Build fuzzer
        run: |
          clang++ -fsanitize=fuzzer,address -g -O2 \
            fuzz/harness.cc src/*.cc -o fuzz_target

      - name: Restore corpus
        uses: actions/cache@v4
        with:
          path: corpus
          key: fuzz-corpus-${{ github.sha }}
          restore-keys: fuzz-corpus-

      - name: Run fuzzer
        run: |
          mkdir -p corpus
          timeout 3600 ./fuzz_target corpus/ || true

      - name: Save corpus
        uses: actions/cache/save@v4
        if: always()
        with:
          path: corpus
          key: fuzz-corpus-${{ github.sha }}

      - name: Upload crashes
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: crashes
          path: crash-*
```

### cargo-fuzz in CI

```yaml
name: Rust Fuzzing

on:
  schedule:
    - cron: '0 2 * * *'

jobs:
  fuzz:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Rust nightly
        uses: dtolnay/rust-toolchain@nightly

      - name: Install cargo-fuzz
        run: cargo install cargo-fuzz

      - name: Run fuzzer
        run: |
          cargo +nightly fuzz run fuzz_target_1 -- \
            -max_total_time=3600 \
            -max_len=4096
```

### OSS-Fuzz Integration

```yaml
# .clusterfuzzlite/project.yaml
language: c++
main_repo: 'https://github.com/your/project'

# build.sh
#!/bin/bash
$CXX $CXXFLAGS -fsanitize=fuzzer harness.cc -o $OUT/fuzz_target
cp fuzz/corpus/* $OUT/fuzz_target_seed_corpus/
cp fuzz/dict.dict $OUT/fuzz_target.dict
```

---

## Coverage Analysis

### libFuzzer Coverage

```bash
# Build with coverage
clang++ -fsanitize=fuzzer -fprofile-instr-generate -fcoverage-mapping \
    harness.cc target.cc -o fuzz

# Run to collect coverage
LLVM_PROFILE_FILE="cov.profraw" ./fuzz corpus/ -runs=0

# Generate report
llvm-profdata merge -sparse cov.profraw -o cov.profdata
llvm-cov show ./fuzz -instr-profile=cov.profdata -format=html > coverage.html
```

### AFL++ Coverage

```bash
# Run with coverage tracking
afl-cov -d out --coverage-cmd "./fuzz AFL_FILE" --code-dir ./src

# View results
firefox out/cov/index.html
```

### Coverage Targets

| Coverage Level | Action |
|---------------|--------|
| < 50% | Improve harness, add seeds |
| 50-70% | Add dictionary, run longer |
| 70-85% | Good progress, continue |
| > 85% | Excellent, consider new targets |

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Fuzzing with default seeds | Slow coverage growth | Provide valid example inputs |
| No sanitizers | Miss memory bugs | Always use ASan for C/C++ |
| Short campaigns | Miss rare bugs | Run for days/weeks |
| Single fuzzer type | Limited mutation | Combine AFL++ + libFuzzer |
| No dictionary | Slow on parsers | Create format-specific dict |
| Ignoring stability | Wasted cycles | Fix non-determinism first |

---

## Checklist

### Before Starting

- [ ] Target function identified and isolated
- [ ] Build system supports Clang/GCC with instrumentation
- [ ] Seed corpus prepared (valid inputs)
- [ ] Dictionary created (for parsers)
- [ ] CI resources allocated

### Harness Quality

- [ ] Harness is deterministic
- [ ] Global state reset between runs
- [ ] Input size validated
- [ ] Error paths don't call exit()
- [ ] Memory is freed properly

### Campaign Monitoring

- [ ] Execution speed > 100/sec (ideally > 1000)
- [ ] Stability > 85%
- [ ] Coverage increasing over time
- [ ] Crashes triaged regularly
- [ ] Corpus saved and versioned

### Production Readiness

- [ ] Fuzzing integrated into CI
- [ ] Corpus maintained between runs
- [ ] Crashes block releases
- [ ] Coverage tracked over time
- [ ] Team trained on triage

---

## Resources

### Documentation
- [AFL++ Docs](https://aflplus.plus/docs/)
- [libFuzzer Reference](https://llvm.org/docs/LibFuzzer.html)
- [Rust Fuzz Book](https://rust-fuzz.github.io/book/)

### Tutorials
- [Google Fuzzing Tutorial](https://github.com/google/fuzzing/blob/master/tutorial/libFuzzerTutorial.md)
- [Trail of Bits Fuzzing Guide](https://github.com/trailofbits/testing-handbook)

### Services
- [OSS-Fuzz](https://github.com/google/oss-fuzz) - Free fuzzing for open source
- [ClusterFuzzLite](https://google.github.io/clusterfuzzlite/) - CI-integrated fuzzing
