---
title: "Two pointers"
date: 2026-07-09
tags: [C++, Neetcode, 'DSA']
series: "Neetcode 150"
part: 2
---

## Two pointers
The two pointer approach is useful when you are tired of O(n2) solutions and multiple passes over the same data. You use two different pointers, and converge to the solution based on the problem. But the problem with it, is that the approach is same but framing is different for each problem. These can be categorized in three buckets:
1. **Scan & Verify:** When you use two pointers just for checking a condition (such as in [Valid Palindrome](#1-valid-palindrome)).
2. **Comparing against a target:** When you use two pointers to look for a solution that satisfies a target. Whatever brings you closer to the target, go there (such as in [Two Sum II](#2-two-sum-ii---sorted-array)).
3. **Exchange-argument optimization:** When you have no fixed target, but you're optimizing a solution, such as looking for a maximum. Used in both [Container with most water](#4-container-with-most-water) and [Trapping Rain Water](#5-trapping-rain-water). 
### 1. Valid Palindrome
```cpp title:"My solution"
class Solution {
public:
    bool isAlpha(char& c){
        if (c > 64 && c < 91) {
            c = c + 32;
            return true;
        }
        if (c > 96 && c < 123) return true;
        if (c > 47 && c < 58) return true;
        return false;
    }
    
    bool isPalindrome(string s) {
        int n = s.size();
        int i = 0;
        int j = n-1;
        while (i<j){
            if (!isAlpha(s[i])) {
                i++;
                continue;
            }
            if (!isAlpha(s[j])){
                j--;
                continue;
            }
            if (s[i] != s[j]) return false;
            i++;
            j--;
        }
        return true;
    }
};
```

#### Problems I faced
- I mean. Strings. I know they are arrays, but that isn't the problem anymore.
- This question was slightly different, because we were given alphanumeric characters only. They are all the english alphabets, and the numbers 0-9.
- I had to look up the ranges of these characters, and then I found out that the strings would contain spaces as well. So I thought let's create a new function itself, which will check if it is alphanumeric or not.
- Even though the question said it was case-insensitive, I still converted the capital letters to small letters by adding 32 to the ascii values. (I forgot it was case insensitive but I don't regret it).
- I forgot to add `continue` in the if conditions and ended up checking the equality each time even after `i` or `j` changed. I thought it would work without continue, because the `if` conditions before it ensured that i and j pointed to alphanumeric characters only.
- Two pointers isn't new to me. The previous array questions had me doing things in one passes.
#### What can be done better?
- Clearly this solution is inefficient. First off, I created a separate function that let's me check for alphanumeric. I didn't know the library function which is `isalnum()` from `<cctype>` library. And adding 32 to ascii values can be replaced with `tolower()`.
- Then that function I wrote also changes uppercase to lowercase automatically, so even though I made it deliberately, it's better to write readable code that doesn't do what it's name says it does. Again, if I did want uppercase values then I'd have removed it, but no one would know.
- Case insensitive means 'A' and 'a' are treated the same. So in this question, since both ascii values would still be different, I need to convert one into the other. If it was case sensitive, then I wouldn't have to because I'd need to make sure 'A' matches only 'A' and not 'a'.
- Then, one gotcha. Both `isalnum()` and `tolower()` require a `unsigned char` (non-negative) and `char` is sometimes negative too. This would throw an undefined behaviour (UB).
- Something called *casting* saves that. It converts signed stuff to unsigned stuff. So, we do `isalnum(static_cast<unsigned char>(c))` and `tolower(static_cast<unsigned char>(c))`. This converts a negative c into the right ascii value (0-255). By conversion, we mean *"Reading the same bits differently"*
- Complexity? We only operated O(n) times. And O(1) space because we didn't create anything. 
#### About casting
- Casting is done when you need to *reinterpret* a datatype into another data type.
- In C, we could typecast something with `(datatype) expression` like `(int)myFloat` but this is quite vague for the different reasons it can fail. So C++ adds 4 different types of casting.
- **Static Casting:** Converts between compatible/related types. Done during compile time.
- **Dynamic Casting:** Safely downcasts inside polymorphic hierarchies. These are in classes with atleast one virtual function. But since I can't remember OOPs concepts, I will box this for later.
- **Const Casting:** Adds or removes const or volatile qualifiers. Meaning if I termed some variable as unchangeable, then changing that can cause issues in complex codes.
- **Reinterpret Casting:** This is low-level, aka close to machine language, aka playing with memory. It directs the compiler to interpret raw binary memory bits of an expression exactly as if it were a totally distinct data type. 
- Anyways, we care about static_cast, useful for converting ints to floats, signed to unsigned, changes inheritance from a derived class to a base class. It checks at compile time, and if just isn't possible (like int to struct) it won't compile. But IT WILL COMPILE and not throw error if we did something that's fine for a computer but logically not right. Like converting a double into an int. This will lose the decimal.
- Anyways, here's the final codes.
```cpp title"Cleaner solution"
class Solution {
public:
    bool isPalindrome(string s) {
        int n = s.size();
        int i = 0;
        int j = n-1;
        while (i<j){
            if (!isalnum(static_cast<unsigned char>(s[i]))) {
                i++;
                continue;
            }
            if (!isalnum(static_cast<unsigned char>(s[j]))){
                j--;
                continue;
            }
            if (tolower(static_cast<unsigned char>(s[i])) != tolower(static_cast<unsigned char>(s[j]))) return false;
            i++;
            j--;
        }
        return true;
    }
};
```

### 2. Two Sum II - sorted array
```cpp title:'My solution'
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        int i=0;
        int j = nums.size()-1;
        while(nums[i] + nums[j] != target){
            int sum = nums[i] + nums[j];
            if (sum > target){
                j--;
                continue;
            }
            if (sum < target){
                i++;
                continue;
            }
        }
        return {i+1, j+1};

    }
};
```

#### Problems I faced
- NONE! The code run perfectly and got submitted in one try.
- At first I thought I'd use the slow/fast thingy, but it was skipping elements in my head. Then binary search where I'd half i or j but that still skipped elements and never known whether increasing i or decreasing j would give a higher or lower target. So didn't attempt that either.
- Simply, increase i and decrease j, array is sorted so we know we are converging by checking the inequality against sum. We didn't have that in normal two sum, where numbers were random and we didn't know which pointer to change.
#### What can be made better?
- This solution worked because we were guaranteed a solution. But if there wasn't, the equality would need to be `i<j` so we know it ends even after checking all possible elements through individual work of i and j.
- Instead of continue, we can cleanly write if else statements since we don't check AFTER the ifs but before them.
```cpp title:'Cleaner Solution'
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        int i=0;
        int j = nums.size()-1;
        while(i<j){
            int sum = nums[i] + nums[j];
            if (sum == target) return {i+1, j+1};
            else if (sum > target) j--;
            else i++;
        }
        return {};
    }
};
```

### 3. 3sum
```cpp title:'My solution'
class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        set<vector<int>> answer;
        int i = 0;
        while (i < nums.size()-2){
            int j = i+1;
            int k = nums.size() - 1;
            while (j < k){
                if (nums[i] + nums[j] + nums[k] < 0) j++;
                else if (nums[i] + nums[j] + nums[k] > 0) k--;
                else {
                    answer.insert({nums[i], nums[j], nums[k]});
                    j++;
                }
            }
            i++;
        }

        vector<vector<int>> output;
        for (const auto& x : answer){
            output.push_back(x);
        }
        return output;
    }
};
```

#### Problems I faced
- A lot of problems were faced. At first, I was so confused on what to do. Then thought of the approach of i++, j--, and loop between them. I was trying really hard to not have a O(n3) solution. But this was skipping elements again because i and j are moving to the center at the same rate and we would miss elements that are skewed on the backward side. Like elements that didn't get included due to change in i or j before we tried all combinations.
- However, this error only came after it worked for a few test cases and gave me a duplication output. So, in the final output vector I needed unique elements. I thought I'd create an `unordered_set` but apparently it doesn't store and compare vectors well. I looked up, it was asking me to create a custom differentiator function which I have no idea about, but then I was told that normal `set` works with vectors and I did that. 
- The final solution I conjured up where I'd have one outer loop for `i` and do the same two pointer approach for two sum on a sorted array.
- Time complexity: O(n2.logm) where m is number of elements in set. Insert operation is costing me. Space: O(n)
- I am completely aware that this solution is inefficient. But I'm at least glad I solved it myself.
#### What can be made better?
- Alright so my solution can be improved by skipping the duplication.  Set doesn't allow duplicates yes, but due to insert operation we were suffering. Instead we can just skip the duplicate numbers AS we encounter them in the array.
- The initial check for `i` we check whether the previous number at `i-1` is same as `i` and if it is, we skip it.
- When we find a new `i` then start with two pointers `j` and `k`, do the testing and when we have found a triplet, it's possible the elements near `j` and `k` are same (since array was sorted) and we should skip them since they would only form duplicate triplets. 
- Another skipping mechanic, the moment `i` points to something more than 0, then j and k are also greater than 0 and we can possible not have any more triplets. So we end early.
- No set this time, only a vector. So O(n) space. O(n2) time because no insert operation.
- Here's the more efficient solution.
```cpp title:'More efficient'
class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<vector<int>> output;
        int i = 0;
        while (i < nums.size()-2){
            if (nums[i] > 0) break;
            if (i > 0 && nums[i] == nums[i-1]) {
                i++;
                continue;
            }
            int j = i+1;
            int k = nums.size() - 1;
            while (j < k){
                int sum = nums[i] + nums[j] + nums[k];
                if (sum < 0) j++;
                else if (sum > 0) k--;
                else {
                    output.push_back({nums[i], nums[j], nums[k]});
                    j++;
                    k--;
                    while (j<k && nums[j] == nums[j-1]) j++;
                    while (j<k && nums[k] == nums[k+1]) k--;
                }
            }
            i++;
        }
        return output;
    }
};
```

### 4. Container With Most Water
```cpp 'My solution'
class Solution {
public:
    int maxArea(vector<int>& h) {
        int n = h.size();
        int i = 0;
        int j = n-1;
        int maxi = 0;
        while (i < j){
            int area = (j-i)*min(h[i], h[j]);
            maxi = max(area, maxi);
            if (h[i]<h[j]) i++;
            else j--;
        }
        return maxi;
    }
};
```

#### Problem I faced
- I was not able to solve this problem myself. After trying really hard to think of a solution, I only managed to think of the idea of moving TOWARDS the height that gave me a higher water value. If i++ gave me a higher water than j-- than I'd move forward with i++ and not j-- then repeat, while storing the absolute max. But this didn't work. It wasn't converging to the best pair.
- I had to look up the hints in the problem. It told me that you only move the index that was the lesser one than the other. Because if we didn't move it, the absolute max that this height can give is lesser than before because width would be lower. So we need to change this one, and keep the other longer height same. Slowly, both height bars would be bigger than before.
#### Why it works
- You see, this works because in the two pointer approach, convergence is only guaranteed if you do something that's better, or if you do something that is the reverse of what isn't working. This problem is the latter. Because moving the lower tower is the only way you can have a different answer than the current one, which might be better. If we moved the higher tower first, the score would still be at most the other lower height (but lower width, so probably worse!). 
- Since we did the opposite, and also checked each possibility too (because either i or j moves until we reach the best, because there will always be one lower tower) we converged.

### 5. Trapping rain water
```cpp title:'My solution'
class Solution {
public:
    int trap(vector<int>& height) {

        int n = height.size();
        vector<int> water;
        for (int i =0; i < n; i++){
            int l=0;
            int r=0;
            for (int j = 0; j < i; j++){
                l = max(l, height[j]);
            }
            for (int j = i+1; j < n; j++){
                r = max(r, height[j]);
            }
            water.push_back(max(min(l,r)-height[i], 0));
        }
        int sum = 0;
        for (int x : water){
            sum += x;
        }
        return sum;
    }
};
```

#### Problems I faced
- Well clearly this is a hard problem. I was completely lost on what to do. 
- I had to look up at the hints, which gave me the idea of how to calculate the height of water at each index. It clicked, and wrote this solution
- But it pains me that this is an O(n2) solution. The question said it should be at most or better than O(n).
- My solution does not contain anything related to two pointers. 
- But wait, I can replace it! Let's code it!!!! 

```cpp title:"Solution in O(n)"
class Solution {
public:
    int trap(vector<int>& height) {

    int n = height.size();
    vector<int> water;
    int l=0;
    for (int i=0; i < n; i++){
        l = max(l, height[i]);
        water.push_back(l);
    }
    // now water vector contains best heights from the left
    // we can directly compute right best and amount of water now
    int r = 0;
    for (int i=n-1; i >=0; i--){
        water[i] = (max(0, min(r, water[i])-height[i]));
        r = max(r, height[i]);
    }

    int sum = 0;
    for (int x : water){
        sum += x;
    }
    return sum;
    }
};
```
- LETS GOOOOOO!!!
- But this is still not using two pointer approach. This is still two passes. What else can we think of?
#### What can be done better?
- Yeah so this better solution is quite hard to see. 
- First see the solution.
```cpp title:'two pointer approach'
class Solution {
public:
    int trap(vector<int>& height) {
    int n = height.size();
    int totalwater = 0;
    int l = 0;
    int r = n - 1;
    int leftMax = 0;
    int rightMax = 0;
    while (l<r){
        if (height[l] < height[r]){
            leftMax = max(leftMax, height[l]);
            totalwater += leftMax - height[l];
            l++;
        }
        else {
            rightMax = max(rightMax, height[r]);
            totalwater += rightMax - height[r];
            r--;
        }
    }
    return totalwater;
    }
};
```
- We only move the index of the bar with the lower height again.
- We only process the left side when `height[l] < height[r]`. 
- So whatever we have at `l`, we calculate the water there. `leftMax` contains the best height before current `l`. We calculate total water by `leftMax - current_height` without looking at the right side. Why? Because it was guaranteed that `height[l] < height[r]` making left the only bottleneck. You'd wonder *what if height[r] was lower than leftMax?* which is the confusing part. But the solution would never reach that point because we cannot get `leftMax > height[r]`. The movement of `l` and `r` is such that that condition never arrives. leftMax must've been processed before, meaning `l` was at `leftMax` sometime before, and we only got leftMax value when some `height[r]` was already bigger. Now `r` didn't move, and it only moves when `height[l]` is higher than `height[r]` which can only be lesser than or equal to the previous rightMax. So leftMax never grew past it's big `height[r]` and is already higher than current `height[l]`. Meaning we right side is bigger than left side, and left side is the bottle neck.
