---
name: property-based-testing-advanced
description: Advanced Hypothesis and fast-check patterns for property-based testing. Covers generator composition, shrinking strategies, state machine testing, and stateful testing for complex systems.
version: 1.0.0
tags: [testing, property-based, hypothesis, fast-check, generators, shrinking, state-machine]
triggers: [property-test, hypothesis, fast-check, quickcheck, generator, shrinking, stateful-test]
---

# Property-Based Testing Advanced

Comprehensive patterns for property-based testing with Hypothesis (Python) and fast-check (TypeScript). This skill covers generator composition, shrinking strategies, state machine testing, and advanced stateful testing patterns.

## Overview

Property-based testing generates random inputs to verify invariants hold across all cases. This skill extends beyond basic roundtrip testing to cover complex scenarios: custom generators, state machine models, and integration with real systems.

## When to Use

Invoke this skill when:
- Testing serialization/deserialization (roundtrip)
- Validating business logic invariants
- Testing state machines with complex transitions
- Need better error reports through shrinking
- Testing concurrent or stateful systems
- Property-based testing provides stronger coverage than unit tests

## When NOT to Use

- Simple CRUD without transformation logic
- Integration tests requiring external services
- Tests where specific examples are sufficient
- Prototyping with fluid requirements
- UI/presentation layer testing

---

## Generator Composition Techniques

### Python (Hypothesis)

#### Basic Composition

```python
from hypothesis import given, strategies as st

# Combine primitives
@given(
    name=st.text(min_size=1, max_size=100),
    age=st.integers(min_value=0, max_value=150),
    email=st.emails()
)
def test_user_creation(name, age, email):
    user = User(name=name, age=age, email=email)
    assert user.is_valid()
```

#### Custom Strategies with `@composite`

```python
from hypothesis import strategies as st
from hypothesis.strategies import composite

@composite
def valid_user(draw):
    """Generate valid User objects with consistent data."""
    name = draw(st.text(min_size=1, max_size=50, alphabet=st.characters(
        whitelist_categories=('L', 'N', 'P'),
        whitelist_characters=' '
    )))
    age = draw(st.integers(min_value=18, max_value=120))

    # Conditional generation based on age
    if age >= 65:
        status = draw(st.sampled_from(['retired', 'active']))
    else:
        status = draw(st.sampled_from(['student', 'employed', 'unemployed']))

    return User(name=name.strip(), age=age, status=status)

@given(user=valid_user())
def test_user_validation(user):
    assert user.is_valid()
    assert len(user.name) > 0
```

#### Recursive Strategies

```python
# Generate recursive data structures (e.g., JSON-like trees)
json_primitives = st.none() | st.booleans() | st.floats(allow_nan=False) | st.text()

json_strategy = st.recursive(
    json_primitives,
    lambda children: st.lists(children) | st.dictionaries(st.text(), children),
    max_leaves=50
)

@given(data=json_strategy)
def test_json_roundtrip(data):
    serialized = json.dumps(data)
    deserialized = json.loads(serialized)
    assert data == deserialized
```

#### Dependent Generators

```python
@composite
def matrix_and_vector(draw):
    """Generate matrix and compatible vector for multiplication."""
    rows = draw(st.integers(min_value=1, max_value=100))
    cols = draw(st.integers(min_value=1, max_value=100))

    matrix = draw(st.lists(
        st.lists(st.floats(allow_nan=False, allow_infinity=False), min_size=cols, max_size=cols),
        min_size=rows, max_size=rows
    ))

    # Vector must have same dimension as matrix columns
    vector = draw(st.lists(
        st.floats(allow_nan=False, allow_infinity=False),
        min_size=cols, max_size=cols
    ))

    return matrix, vector

@given(matrix_and_vector())
def test_matrix_vector_multiply(data):
    matrix, vector = data
    result = multiply(matrix, vector)
    assert len(result) == len(matrix)
```

### TypeScript (fast-check)

#### Basic Composition

```typescript
import fc from 'fast-check';

// Combine arbitraries
fc.assert(
  fc.property(
    fc.string({ minLength: 1, maxLength: 100 }),
    fc.integer({ min: 0, max: 150 }),
    fc.emailAddress(),
    (name, age, email) => {
      const user = new User(name, age, email);
      return user.isValid();
    }
  )
);
```

#### Custom Arbitraries with `chain`

```typescript
import fc from 'fast-check';

// Dependent generation
const validUser = fc.integer({ min: 18, max: 120 }).chain((age) => {
  const statusOptions = age >= 65
    ? ['retired', 'active']
    : ['student', 'employed', 'unemployed'];

  return fc.record({
    name: fc.string({ minLength: 1, maxLength: 50 }),
    age: fc.constant(age),
    status: fc.constantFrom(...statusOptions),
  });
});

fc.assert(
  fc.property(validUser, (user) => {
    return new User(user.name, user.age, user.status).isValid();
  })
);
```

#### Recursive Arbitraries

```typescript
// JSON-like recursive structure
const jsonArbitrary: fc.Arbitrary<unknown> = fc.letrec((tie) => ({
  json: fc.oneof(
    fc.constant(null),
    fc.boolean(),
    fc.double({ noNaN: true }),
    fc.string(),
    fc.array(tie('json'), { maxLength: 10 }),
    fc.dictionary(fc.string(), tie('json'), { maxKeys: 10 })
  ),
})).json;

fc.assert(
  fc.property(jsonArbitrary, (data) => {
    const serialized = JSON.stringify(data);
    const deserialized = JSON.parse(serialized);
    return deepEqual(data, deserialized);
  })
);
```

---

## Shrinking Strategies

Shrinking finds the minimal failing case, making debugging easier.

### Python (Hypothesis) Shrinking

```python
from hypothesis import given, strategies as st, settings, Verbosity

# Enable verbose output to see shrinking
@settings(verbosity=Verbosity.verbose)
@given(st.lists(st.integers()))
def test_sorted_invariant(lst):
    sorted_lst = sorted(lst)
    # This will fail and shrink to minimal case
    assert sorted_lst == lst  # Fails for [1, 0]
```

#### Custom Shrinking with `filter` and `map`

```python
# Hypothesis automatically shrinks through filter/map
@composite
def valid_percentage(draw):
    """Shrinks toward 0, but stays in valid range."""
    value = draw(st.floats(min_value=0.0, max_value=100.0))
    return round(value, 2)

# Custom shrinking by controlling generation order
@composite
def ordered_pair(draw):
    """Generate (a, b) where a <= b, shrinks toward (0, 0)."""
    a = draw(st.integers(min_value=0, max_value=100))
    b = draw(st.integers(min_value=a, max_value=100))
    return (a, b)
```

### TypeScript (fast-check) Shrinking

```typescript
import fc from 'fast-check';

// Custom shrinking with map
const percentage = fc.double({ min: 0, max: 100 })
  .map((n) => Math.round(n * 100) / 100);

// Shrinking maintains constraints
const orderedPair = fc.tuple(
  fc.integer({ min: 0, max: 100 }),
  fc.integer({ min: 0, max: 100 })
).filter(([a, b]) => a <= b);

// Better: Use chain for dependent values (better shrinking)
const orderedPairBetter = fc.integer({ min: 0, max: 100 }).chain((a) =>
  fc.integer({ min: a, max: 100 }).map((b) => [a, b] as const)
);
```

### Shrinking Best Practices

| Practice | Why | Example |
|----------|-----|---------|
| Use built-in strategies | Better shrinking | `st.integers()` vs manual |
| Prefer `chain` over `filter` | Filter can't shrink | Dependent generation |
| Avoid `assume()` when possible | Breaks shrinking | Use constrained generators |
| Test shrinking manually | Verify minimal cases | `@settings(max_examples=1)` |

---

## State Machine Testing

State machine testing models your system as states and transitions, then generates random sequences of operations to find bugs.

### Python (Hypothesis) State Machine

```python
from hypothesis.stateful import RuleBasedStateMachine, rule, invariant, Bundle

class DatabaseStateMachine(RuleBasedStateMachine):
    """Test database operations maintain invariants."""

    def __init__(self):
        super().__init__()
        self.db = Database()
        self.model = {}  # Reference model

    keys = Bundle('keys')

    @rule(target=keys, key=st.text(min_size=1))
    def insert(self, key):
        """Insert a new key with a generated value."""
        value = f"value_{len(self.model)}"
        self.db.insert(key, value)
        self.model[key] = value
        return key

    @rule(key=keys)
    def get(self, key):
        """Get an existing key."""
        result = self.db.get(key)
        assert result == self.model.get(key), f"Expected {self.model.get(key)}, got {result}"

    @rule(key=keys)
    def delete(self, key):
        """Delete an existing key."""
        self.db.delete(key)
        self.model.pop(key, None)

    @rule(key=st.text(min_size=1))
    def get_missing(self, key):
        """Get a potentially missing key."""
        if key not in self.model:
            result = self.db.get(key)
            assert result is None

    @invariant()
    def size_matches(self):
        """Database size should match model."""
        assert len(self.db) == len(self.model)

    @invariant()
    def no_duplicates(self):
        """No duplicate keys should exist."""
        assert len(set(self.db.keys())) == len(self.db.keys())


# Run the state machine
TestDatabase = DatabaseStateMachine.TestCase
```

### TypeScript (fast-check) State Machine

```typescript
import fc from 'fast-check';

interface DbModel {
  data: Map<string, string>;
}

interface DbReal {
  insert(key: string, value: string): void;
  get(key: string): string | undefined;
  delete(key: string): void;
  size(): number;
}

// Command definitions
class InsertCommand implements fc.Command<DbModel, DbReal> {
  constructor(readonly key: string, readonly value: string) {}

  check(_m: Readonly<DbModel>) {
    return true; // Always valid
  }

  run(m: DbModel, r: DbReal) {
    r.insert(this.key, this.value);
    m.data.set(this.key, this.value);
  }

  toString() {
    return `insert(${this.key}, ${this.value})`;
  }
}

class GetCommand implements fc.Command<DbModel, DbReal> {
  constructor(readonly key: string) {}

  check(m: Readonly<DbModel>) {
    return m.data.has(this.key); // Only valid for existing keys
  }

  run(m: DbModel, r: DbReal) {
    const expected = m.data.get(this.key);
    const actual = r.get(this.key);
    expect(actual).toBe(expected);
  }

  toString() {
    return `get(${this.key})`;
  }
}

class DeleteCommand implements fc.Command<DbModel, DbReal> {
  constructor(readonly key: string) {}

  check(m: Readonly<DbModel>) {
    return m.data.has(this.key);
  }

  run(m: DbModel, r: DbReal) {
    r.delete(this.key);
    m.data.delete(this.key);
  }

  toString() {
    return `delete(${this.key})`;
  }
}

// Command generator
const allCommands = [
  fc.tuple(fc.string(), fc.string()).map(([k, v]) => new InsertCommand(k, v)),
  fc.string().map((k) => new GetCommand(k)),
  fc.string().map((k) => new DeleteCommand(k)),
];

// Run the test
fc.assert(
  fc.property(fc.commands(allCommands, { maxCommands: 100 }), (cmds) => {
    const model: DbModel = { data: new Map() };
    const real: DbReal = new Database();

    fc.modelRun(() => ({ model, real }), cmds);
  })
);
```

---

## Stateful Testing Patterns

### Testing Concurrent Systems

```python
from hypothesis import given, strategies as st, settings
from hypothesis.stateful import RuleBasedStateMachine, rule, initialize
import threading

class ConcurrentQueueMachine(RuleBasedStateMachine):
    """Test thread-safe queue under concurrent operations."""

    @initialize()
    def setup(self):
        self.queue = ThreadSafeQueue()
        self.expected_items = []
        self.lock = threading.Lock()

    @rule(item=st.integers())
    def enqueue(self, item):
        def do_enqueue():
            self.queue.enqueue(item)
            with self.lock:
                self.expected_items.append(item)

        thread = threading.Thread(target=do_enqueue)
        thread.start()
        thread.join(timeout=1.0)

    @rule()
    def dequeue(self):
        def do_dequeue():
            result = self.queue.dequeue()
            if result is not None:
                with self.lock:
                    if result in self.expected_items:
                        self.expected_items.remove(result)

        thread = threading.Thread(target=do_dequeue)
        thread.start()
        thread.join(timeout=1.0)

    @rule()
    def check_consistency(self):
        """Queue items should eventually match expected."""
        # Allow for eventual consistency
        actual = list(self.queue)
        with self.lock:
            expected = self.expected_items[:]
        assert sorted(actual) == sorted(expected)
```

### Testing with External State

```python
from hypothesis.stateful import RuleBasedStateMachine, rule, precondition

class FileSystemMachine(RuleBasedStateMachine):
    """Test file operations with cleanup."""

    def __init__(self):
        super().__init__()
        self.files = set()
        self.temp_dir = tempfile.mkdtemp()

    @rule(name=st.text(min_size=1, max_size=20, alphabet='abcdefghijklmnop'))
    def create_file(self, name):
        path = os.path.join(self.temp_dir, name)
        with open(path, 'w') as f:
            f.write(name)
        self.files.add(name)

    @precondition(lambda self: len(self.files) > 0)
    @rule(data=st.data())
    def read_file(self, data):
        name = data.draw(st.sampled_from(sorted(self.files)))
        path = os.path.join(self.temp_dir, name)
        with open(path) as f:
            content = f.read()
        assert content == name

    @precondition(lambda self: len(self.files) > 0)
    @rule(data=st.data())
    def delete_file(self, data):
        name = data.draw(st.sampled_from(sorted(self.files)))
        path = os.path.join(self.temp_dir, name)
        os.remove(path)
        self.files.remove(name)

    def teardown(self):
        """Clean up after each test."""
        shutil.rmtree(self.temp_dir, ignore_errors=True)
```

---

## Property Catalog

### Algebraic Properties

| Property | Formula | Example |
|----------|---------|---------|
| **Roundtrip** | `decode(encode(x)) == x` | JSON, Protobuf |
| **Idempotence** | `f(f(x)) == f(x)` | normalize, format |
| **Commutativity** | `f(a, b) == f(b, a)` | set union, addition |
| **Associativity** | `f(f(a,b), c) == f(a, f(b,c))` | string concat |
| **Identity** | `f(x, id) == x` | multiply by 1 |
| **Distributivity** | `f(a, g(b,c)) == g(f(a,b), f(a,c))` | multiply over add |

### Implementation Examples

```python
from hypothesis import given, strategies as st

# Roundtrip
@given(st.binary())
def test_compress_decompress_roundtrip(data):
    assert decompress(compress(data)) == data

# Idempotence
@given(st.text())
def test_normalize_idempotent(text):
    assert normalize(normalize(text)) == normalize(text)

# Commutativity
@given(st.frozensets(st.integers()), st.frozensets(st.integers()))
def test_set_union_commutative(a, b):
    assert a | b == b | a

# Associativity
@given(st.text(), st.text(), st.text())
def test_concat_associative(a, b, c):
    assert (a + b) + c == a + (b + c)

# Oracle (compare implementations)
@given(st.lists(st.integers()))
def test_sort_matches_reference(lst):
    assert my_sort(lst) == sorted(lst)
```

```typescript
import fc from 'fast-check';

// Roundtrip
fc.assert(
  fc.property(fc.uint8Array(), (data) => {
    const compressed = compress(data);
    const decompressed = decompress(compressed);
    return arraysEqual(data, decompressed);
  })
);

// Idempotence
fc.assert(
  fc.property(fc.string(), (text) => {
    return normalize(normalize(text)) === normalize(text);
  })
);
```

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Testing trivial getters | Waste of effort | Focus on transformation logic |
| Overusing `assume()` | Breaks shrinking | Use constrained generators |
| Giant composite generators | Hard to debug | Compose small generators |
| No reference model | Can't verify correctness | Build simple model for comparison |
| Ignoring flaky tests | Hides real bugs | Fix non-determinism |
| Too many examples | Slow tests | 100-1000 is usually enough |

---

## Checklist

### Generator Design

- [ ] Use built-in strategies when possible
- [ ] Compose with `@composite` (Python) or `chain` (TypeScript)
- [ ] Constrain at generation, not with `filter`/`assume`
- [ ] Test generators produce valid data
- [ ] Document generator assumptions

### Property Design

- [ ] Property captures real invariant
- [ ] Failures are reproducible
- [ ] Shrinking produces minimal examples
- [ ] Property doesn't duplicate implementation
- [ ] Reference model is simpler than SUT

### State Machine Testing

- [ ] All operations represented as rules/commands
- [ ] Preconditions correctly constrain operations
- [ ] Invariants checked after each operation
- [ ] Model state matches real state
- [ ] Cleanup handles partial failures

### CI Integration

- [ ] Seed saved for reproduction
- [ ] Example database persisted
- [ ] Failure artifacts captured
- [ ] Reasonable timeout set
- [ ] Flaky tests investigated

---

## Examples

### Complete Python Example

```python
"""Property-based tests for a shopping cart."""
from hypothesis import given, strategies as st, settings
from hypothesis.stateful import RuleBasedStateMachine, rule, invariant, Bundle
from decimal import Decimal

class ShoppingCartMachine(RuleBasedStateMachine):
    def __init__(self):
        super().__init__()
        self.cart = ShoppingCart()
        self.model_items = {}
        self.model_total = Decimal('0')

    items = Bundle('items')

    @rule(target=items, product_id=st.uuids(), price=st.decimals(
        min_value=Decimal('0.01'),
        max_value=Decimal('9999.99'),
        places=2
    ))
    def add_item(self, product_id, price):
        self.cart.add(str(product_id), price, quantity=1)
        key = str(product_id)
        if key in self.model_items:
            self.model_items[key]['quantity'] += 1
        else:
            self.model_items[key] = {'price': price, 'quantity': 1}
        self.model_total += price
        return key

    @rule(item=items)
    def remove_item(self, item):
        if item in self.model_items:
            self.model_total -= self.model_items[item]['price']
            self.model_items[item]['quantity'] -= 1
            if self.model_items[item]['quantity'] == 0:
                del self.model_items[item]
            self.cart.remove(item, quantity=1)

    @invariant()
    def total_matches(self):
        assert self.cart.total() == self.model_total

    @invariant()
    def item_count_matches(self):
        cart_count = sum(self.cart.quantities().values())
        model_count = sum(i['quantity'] for i in self.model_items.values())
        assert cart_count == model_count

    @invariant()
    def total_non_negative(self):
        assert self.cart.total() >= Decimal('0')


TestShoppingCart = ShoppingCartMachine.TestCase
```

### Complete TypeScript Example

```typescript
/**
 * Property-based tests for a key-value store
 */
import fc from 'fast-check';

interface KVStore {
  set(key: string, value: string): void;
  get(key: string): string | undefined;
  delete(key: string): boolean;
  keys(): string[];
}

// Commands for state machine testing
class SetCommand implements fc.Command<Map<string, string>, KVStore> {
  constructor(readonly key: string, readonly value: string) {}
  check() { return true; }
  run(model: Map<string, string>, real: KVStore) {
    model.set(this.key, this.value);
    real.set(this.key, this.value);
  }
  toString() { return `set(${this.key}, ${this.value})`; }
}

class GetCommand implements fc.Command<Map<string, string>, KVStore> {
  constructor(readonly key: string) {}
  check() { return true; }
  run(model: Map<string, string>, real: KVStore) {
    expect(real.get(this.key)).toBe(model.get(this.key));
  }
  toString() { return `get(${this.key})`; }
}

class DeleteCommand implements fc.Command<Map<string, string>, KVStore> {
  constructor(readonly key: string) {}
  check(model: Readonly<Map<string, string>>) {
    return model.has(this.key);
  }
  run(model: Map<string, string>, real: KVStore) {
    model.delete(this.key);
    expect(real.delete(this.key)).toBe(true);
  }
  toString() { return `delete(${this.key})`; }
}

class KeysCommand implements fc.Command<Map<string, string>, KVStore> {
  check() { return true; }
  run(model: Map<string, string>, real: KVStore) {
    const expected = Array.from(model.keys()).sort();
    const actual = real.keys().sort();
    expect(actual).toEqual(expected);
  }
  toString() { return 'keys()'; }
}

describe('KVStore', () => {
  it('maintains consistency under random operations', () => {
    const commands = [
      fc.tuple(fc.string(), fc.string()).map(([k, v]) => new SetCommand(k, v)),
      fc.string().map((k) => new GetCommand(k)),
      fc.string().map((k) => new DeleteCommand(k)),
      fc.constant(new KeysCommand()),
    ];

    fc.assert(
      fc.property(
        fc.commands(commands, { maxCommands: 50 }),
        (cmds) => {
          const model = new Map<string, string>();
          const real = new InMemoryKVStore();
          fc.modelRun(() => ({ model, real }), cmds);
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('roundtrip: get returns what was set', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), (key, value) => {
        const store = new InMemoryKVStore();
        store.set(key, value);
        return store.get(key) === value;
      })
    );
  });

  it('idempotence: delete is idempotent', () => {
    fc.assert(
      fc.property(fc.string(), (key) => {
        const store = new InMemoryKVStore();
        store.set(key, 'value');
        store.delete(key);
        const result = store.delete(key); // Second delete
        return result === false && store.get(key) === undefined;
      })
    );
  });
});
```

---

## Resources

### Documentation
- [Hypothesis Documentation](https://hypothesis.readthedocs.io/)
- [fast-check Documentation](https://fast-check.dev/)
- [QuickCheck (original)](https://hackage.haskell.org/package/QuickCheck)

### Papers
- [QuickCheck: A Lightweight Tool for Random Testing of Haskell Programs](https://www.cs.tufts.edu/~nr/cs257/archive/john-hughes/quick.pdf)
- [Finding Race Conditions in Erlang with QuickCheck and PULSE](https://www.cse.chalmers.se/~nicsma/papers/finding-race-conditions.pdf)

### Talks
- [Testing the Hard Stuff and Staying Sane](https://www.youtube.com/watch?v=zi0rHwfiX1Q) - John Hughes
- [Property-Based Testing with PropEr, Erlang, and Elixir](https://propertesting.com/)
