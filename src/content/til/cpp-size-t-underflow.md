---
title: "size_t is unsigned, so counting down past zero wraps around"
date: 2026-07-03
tags: ["c++", "gotchas"]
---

I had a loop that walked a vector backwards and it never terminated. The bug is
that `size_t` is **unsigned**, so it can never be negative — subtracting past
zero wraps to a huge positive number instead.

```cpp
// Broken: when i == 0, --i wraps to SIZE_MAX, so i >= 0 is always true.
for (size_t i = v.size() - 1; i >= 0; --i) {
    use(v[i]);
}
```

The same trap hides in any `v.size() - 1` when the vector is empty: `0u - 1`
is `SIZE_MAX`, not `-1`, so a "last index" computed that way points way off the
end.

One fix is to offset the index by one and count the *other* variable down, so
the loop variable stays in valid unsigned territory:

```cpp
// Fixed: i is the count remaining; the real index is i - 1.
for (size_t i = v.size(); i > 0; --i) {
    use(v[i - 1]);
}
```

The general rule: if a value can go negative, don't store it in an unsigned
type. Reach for a signed index (or C++20's `std::ssize`) when you need to count
below zero.
