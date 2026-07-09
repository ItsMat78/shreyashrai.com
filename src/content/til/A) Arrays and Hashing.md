---
title: "A) Arrays and Hashing"
date: 2026-07-04
tags: ["C++", "DSA", "Neetcode"]
series: "Neetcode 150"
part: 1
featured: true
---
## Arrays and Hashing

### 1. Contains duplicate
```cpp title:"My solution"
class Solution {
public:
    bool hasDuplicate(vector<int>& nums) {
        set<int> myset;
        for (int i=0; i < nums.size(); i++){
            int temp = myset.size();
            myset.insert(nums[i]);
            if (temp == myset.size()) return true;
        }
        return false;
    }
};
```

- Time Complexity: `O(nlogn)` because I used `set`, which uses binary search trees and is ordered. It's insert operation is `O(logn)` so doing it n times = `O(nlogn)`
- Space Complexity: `O(n)`, size of set.

#### What can be made better?
- As `set` is basically BST, it's tree operations take `logn` time. Instead use a hash table (`unordered_set`) which is basically a bucket system, and it's operations are in average case `O(1)`. Close because the worst case is `O(n)` if all the elements collide into ONE bucket.

#### New things
- `Insert`: is an API, it *returns* a `pair<iterator, bool>` where iterator is basically a pointer to either the new element added (in which case bool is `true`) or the already existing element that didn't get inserted again (bool being `false`). Thus, without checking for size in each loop, we could just check if the `pair.second` value was false.
- `count` and `contains` can become alternatives for the if condition, checking if the set contained the element already. But `insert.second` is much cleaner.
- Count: `.count(number)` gives how many times number appeared in the container. For sets and unordered_sets it is either 0 or 1 because each element is unique. So we could use this too.
- Contains (for newer C++20): `.contains(number)` is a boolean function that returns true if an element exists in the container. 
- So instead of *"did size increase?"* we could have *"is this element already in the set?"* If both output 0 (the element was not there) then insert the element and continue. If both output 1 (the element is already there!) break and return, since this is a duplicate.
- So this would eventually lead us to `O(n)` instead of `O(nlogn)`!

#### Some errors that went unnoticed 
- `nums.size()` outputs an unsigned integer `size_t` (a non-negative number) but in the `for` loop, using `int i=0` makes i a signed integer. Now usually this is fine. C++ converts i to unsigned integer during the comparison (`i < nums.size()`) and it doesn't break.
- Yet it WILL break in the case where `nums.size() = 0` and we compute `nums.size() - 1`. The output would not be -1 but some huge number.
- Fix? Use `size_t i` OR write loops using elements themselves (`for (int x : nums)`).

#### Extras
- `size_t` is a type, just like int, float or bool. The standard library uses it for sizes and indices, which are all non-negative numbers. As `.size()` returns `size_t`, it's just better to compare it to an `i` which is `size_t` and not `int`.
- `auto` is the lazy-guy's alternative to all. At compile time (when the code is converted to assembly/machine language) auto is decided by the type of what is on the right side of it.
- So if we wanted the pair output of `set.insert()` we'd have to create `pair<unordered_set<int>::iterator, bool> result = set.insert(number);` but `auto result = set.insert(number)` is easy to write.
- Each STL container has its own iterator, and they're different because of different traversal mechanics used in each container (like set is BST, unordered_set is buckets, vector is contiguous). Each iterator is accessed by `container<type>::iterator` and follows the same three buttons. `*it` outputs object at location, `++it` takes to the next location, and `it != cont.end()` asks if we are at the end or not.
- The number -1 for unsigned integer would be 2^64 - 1 (or 2^32 - 1 for 32 bit systems).

```cpp title:"Using pair.second from the insert operation on unordered_set"
class Solution {
public:
    bool hasDuplicate(vector<int>& nums) {
        unordered_set<int> myset;
        for (size_t i=0; i < nums.size(); i++){
            auto result = myset.insert(nums[i]);
            if (result.second == false) return true;
        }
        return false;
    }
};
```
```cpp title:"using count/contains, both are same"
class Solution {
public:
    bool hasDuplicate(vector<int>& nums) {
        unordered_set<int> myset;
        for (size_t i=0; i < nums.size(); i++){
            if (myset.count(nums[i]) == 1) return true;
            myset.insert(nums[i]);
        }
        return false;
    }
};
```

### 2. Valid Anagram
```cpp title:"My solution"
class Solution {
public:
    bool isAnagram(string s, string t) {
        multiset<char> s_set;
        multiset<char> t_set;
        for (char a : s){
            s_set.insert(a);
        }
        for (char b : t){
            t_set.insert(b);
        }
        if (s_set == t_set) return true;
        return false;
    }
};
```

- Time Complexity: `O((n+m)log(n+m))` Space Complexity: `O(n+m)`
- Can be improved by using two other solutions, each using the same concept:
	- Using a hash map, which stores counts of each char
	- As characters are only 26 in number, an array of 26 size can store frequency of each character and index can be easily calculated using the trick `c - 'a` where c is a character. 
- The concept: As you go along `s` increment counts of each character, and as you go along `t` decrement counts of each character. If both were anagrams, the hashmap or array would all be containing zeroes. If any is non-zero, then both strings had different number of characters or different characters themselves.
```cpp title:"Using unordered_map, O(n)"
class Solution {
public:
    bool isAnagram(string s, string t) {
        unordered_map<char, int> freq;
        for (char a : s){
            freq[a]++;
        }
        for (char b : t){
            freq[b]--;
        }
        for (const auto& x : freq){
            if (x.second != 0) return false;
        }
        return true;
    }
};
```
```cpp title:"Using array, O(1)"
class Solution {
public:
    bool isAnagram(string s, string t) {
        int freq[26] = {0};
        for (char a : s){
            freq[a - 'a']++;
        }
        for (char b : t){
            freq[b - 'a']--;
        }
        for (int x : freq){
            if (x != 0) return false;
        }
        return true;
    }
};
```

#### New
- `auto` vs `auto&`: `auto&` is faster because it doesn't copy the value. It refers to the original value itself. So any modifications to it will modify the original.
- An initial guard of checking both string length would save some time and allow me to write a common `for` loop for both increments and decrements.
- `const` is used to tell the compiler that this variable will not be modified. Even if you try to, it won't work.
- `const auto&` seems counter intuitive (why would I want to auto& for modifying but const to keep it same) but in reality you get best of both worlds here, as auto& saves time but const stops any accidental modifications to the original value.
- But in all seriousness, these `auto&` stuff doesn't really matter for small data types like int, char, bool but does in strings/vectors or bigger data structures. So auto is fine. Both are same speed for the small data types.

### 3. Two sum  
```cpp title:"My solution"
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> hash;
        int n = nums.size();
        for (int i = 0; i < n; i++){
            hash[nums[i]] = i;
        }
        for (int i = 0; i < n; i++){
            if (hash.find(target - nums[i]) != hash.end() && i != hash[target - nums[i]]) return {min(i, hash[target - nums[i]]), max(i, hash[target - nums[i]])};
        }
        return {};
    }
};

```

#### Problems I faced
- Tried a two pointer approach first, incrementing and decrementing one by one but it had a major flaw of ignoring values that aren't symmetrically placed in the array
- Then I knew I had to use the `O(1)` finding ability of `hashmaps`.
- Got confused over `unordered_set` and `unordered_map`
- Had to look up how `find()` works and how if it doesn't work I have to use `hash.end()`
- Problems saving the index, at first tried `hash[nums[i]]+=i` assuming it gets created with 0 first then I could add i to it, but later realized I have to literally equate it to `i`.
- Then only some syntax errors while writing the return value. 
- Wanted to use `auto& x : nums` but needed index information so had to resort to `i`. `find()` gave out an iterator (pointer) which is not what I needed. I could dereference it and find the key (the number) using `.first` and its index (value) using `.second`
- Then faced the same index error which I fixed with a simple condition.

#### What  can be made better  
- Even though this is `O(n)` it required *two* passes (it completed in `2n` time) it was still possible to do it in *one* pass. `n` and `2n` don't matter to Big-O, but one passes achieves the same thing in half the number of operations.
- The possibility being, *before you add the current element, check whether its complement is already in the array. If it is, return. If it's not, add the element in hash map then go to next element.*
- This also solves the same-index error as well, because since we are creating the hash map as we go, same index values don't exist. The moment we find a solution we return.
- It ALSO solves the fact that we have to return the lower index first. Since the current element is the latest one, the complement would already be before it. So its index is automatically lower.
- Why `hash.find(x)->second` is better? Because if I used `hash[x]` it would have created a value in the hash map, being 0. This creation is useless and wastes memory. `hash.find(x)->second` doesn't create anything.
- I could replace `hash.find(x) != hash.end()` with `hash.contains(x)` which is much cleaner but only available in C++20.

```cpp title:"One pass solution"
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> hash;
        int n = nums.size();
        for (int i = 0; i < n; i++){
            int x = target - nums[i];
            if (hash.find(x) != hash.end()) return {hash.find(x)->second, i};
            hash[nums[i]] = i;
        }
        return {};
    }
};
```

### 4. Group Anagrams
```cpp title:"My solution which took me around an hour to submit and get right."
class Solution {
public:
    bool testForAnagram(string s1, string s2){
        if (s1.size() != s2.size()) return false;
        unordered_map<char, int> freq;
        for (int i=0; i<s1.size();i++){
            freq[s1[i]]++;
            freq[s2[i]]--;
        }
        for (auto& x : freq){
            if (x.second != 0) return false;
        }
        return true;
    }

    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        int n = strs.size();
        vector<vector<string>> output;
        for (int i = 0; i < n; i++){
            output.push_back({strs[i]});
        }
        for (int i = 0; i < output.size(); i++){
            for (int j = 0; j < output.size(); j++){
                if (i != j && testForAnagram(output[i][0], output[j][0])){
                    output[i].insert(output[i].end(), output[j].begin(), output[j].end());
                    output.erase(output.begin() + j);
                    j--;
                }
            }
        }
        for (int i = 0; i < output.size(); i++){
            if(output[i].size() == 0) {
                output[i] = output.back();
                output.pop_back();
            }
        }
        return output;
    }
};

```
#### Complexity
- Time: `O(n2.k)`
- Space: `O(n.k)`
#### Problems I faced
- Well at first the problem was hard enough. But I had a feeling I'd be able to at least complete it.
- At first I got the normal anagram function down, the one we did before, in a separate function of its own which I can call anytime. I knew there would be many comparisons this time, so it would be easier to write a function beforehand to stop things from getting messy.
- Then at first I was going for testing each pair of strings, which would be `O(n2)` but before I wrote the `for` loop I thought combining multiple strings into vectors would be tough. So I thought of a different approach.
- I knew I had to create vectors, so I made the trivial solution of no anagrams at all. This was a vector of vectors each with one string. Next I'd start combining the elements of vectors having the their first elements as anagrams. If the vector had a higher size, the first element would confirm that the other elements in it were anagrams themselves. 
- So combining, I had to look up multiple syntaxes. How to insert elements, how to erase elements, how to delete without fucking up everything etc.
- Combined using a method where you grab the second vector and copying all elements inside the first vector. Its syntax was weird (the insert one). Then deleted the second vector. (After seeing a test case fail with heap exceed I realized I had to reduce `j` too because of the deletion).
- I also had a problem of selecting which vectors to combine. At first I had `j=i+1` as the starting condition, but this soon made it such that I'd forget to check elements before `i`. So I just added a guard of `i != j` alongside the anagram function and made `j` start from 0 every time.
- And? Et voila! 
- Clearly this wasn't the best solution lmfao. But I'm happy I solved it.

#### The better way
- The better way is out of this world. It utilizes the concept that *all anagrams, once sorted, are the same.* Which means, *each anagram has a unique 'key'.*
- And guess what? We can have buckets of all anagrams under that unique key, always accessible in O(1) time through a hash map. Each anagram can go into its unique key bucket, and finally, we can output these buckets. Mind = blown.
- Let's try it.
```cpp title:"Hash map solution"
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> u_keys;
        for (const auto& s : strs){
            string key = s;
            sort(key.begin(), key.end());
            u_keys[key].push_back(s);
        }
        vector<vector<string>> output;
        for (const auto& [key, group] : u_keys){
            output.push_back(group);
        }
        return output;
    }   
};

```
- Time Complexity: ` O(n.k.log k)` and Space: `O(n.k)`
- A faster solution exists `O(n.k)`, where I don't have to sort. I can create unique keys myself using arrays.

```cpp title:"Using array to create unique key"
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> u_keys;
        for (const auto& s : strs){
            int freq[26] = {0};
            for (char c : s){
	            freq[c - 'a']++;
            }
            string key = "";
            for (int i=0; i < 26; i++){
	            key += '#';
	            key += to_string(freq[i]);
            }
            u_keys[key].push_back(s);
        }
        vector<vector<string>> output;
        for (const auto& [key, group] : u_keys){
            output.push_back(group);
        }
        return output;
    }   
};  
``` 

- Because `char` is an integer type, it remembers its ascii value. Meaning if `char + int` happens, the output would not be two appended chars but an integer number. When added to the key (a `string`) it would add as the ascii equivalent of that integer, so the final key would actually be weird characters. This is bad because this can confuse the key in cases like `11#2` and `1#12`. Hence why we need a separator `#`.

### 5. Top K frequent elements
- It seems I'm at my mind's limit, so I'm going to take a break now. Here's my brute force solution:
```cpp title:"Top k frequent"
  class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> freq;
        for (int x : nums){
            freq[x]++;
        }
        vector<int> output;
        for (int i=0; i<k; i++){
            int maxi=0;
            for (const auto& [key, value] : freq){
                maxi = max(maxi, value);
            }
            for (const auto& [key, value] : freq){
                if (value == maxi){
                    output.push_back(key);
                    freq[key]=0;
                    break;
                }
            }
        }
        return output;
    }
};
```

- Time Complexity: O(k.n)
- Space Complexity: O(n)

#### Problems I faced
- At first I misundertood the question and solved for 'return whatever number had atleast k frequency' and thought why tf was this a medium problem. 
- Then I realised it was to return the most frequent numbers, and to return the best k among.
- I thought this was simple, but then I found out that you can't really order a hash map through it's values. I'd have to find it manually.
- So I found it manually. Looped k times for the requirement, found the maximum value, then located which key had that maximum value, then inserted it into my output and reset its frequency to 0. Of course I had to break this because that loop needed only one maximum not all of them.

#### What can be done better
- Using bucket sort, we could store the numbers in buckets of their frequencies. Basically, take a vector where *index = frequency* and store the numbers with frequency there in a vector.
- So then each number at say `ith` index appears `i` times.
- Then we can grab the elements in the descending order, as most frequent ones are at the end of the frequency vector. The moment we have k numbers, we return the solution.
- This solution has O(n) and not O(n2) because even though there is a nested loop, the effective work done is ONCE per number. And at most that can be n.

```cpp title:"Better solution using bucket sort, aka storing keys in value buckets"
class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        int n = nums.size();
        vector<vector<int>> freq(n+1);
        unordered_map<int, int> mapp;
        for (int x : nums){
            mapp[x]++; //store frequencies in hashmap
        }
        for (const auto& [key, value] : mapp){
            freq[value].push_back(key); //create a vector at said frequency's location and store the number there
        }
        vector<int> output;
        for (int i = n; i > 0; i--){
            if (freq[i].size() != 0){
                for (int j : freq[i]){ //find the numbers and push to output
                    if (output.size()!=k) output.push_back(j);
                    else break;
                }
            }
        }
        return output;
    }
};
```


### 6. Encode and Decode strings
```cpp title:"My solution"
class Solution {
public:
    char c = 'a' - 1;
    string encode(vector<string>& strs) {
        string s = ""; 
        s += c;
        for (const auto& x : strs){
            s += x;
            s += c;
        }
        return s;
    }

    vector<string> decode(string s) {
        vector<string> output;
        if (s == to_string(c)) {
            output.push_back(s);
            return output;
        }
        string temp = "";
        for (int i = 0; i < s.size(); i++){
            if (s[i] != c){
                temp += s[i];
            }
            else {
                output.push_back(temp);
                temp = "";
            }
        }
        output.erase(output.begin());
        return output;
    }
};
```
#### Problems:
- I knew for a fact that this code was broken. With multiple test cases failing and fixing the test cases only I wasn't thinking in terms of fixes but 'just pass'.
- A fatal flaw in the code is the handling of empty vectors. The encoded string is the delimiter c, and when decoding, we finally pop the first element. This was accidentally working because when an empty string "" was passed it needed to be in the output. But not always.
- In any case, this problem only works on ASCII characters because I used a delimiter not in the ascii range.
- The better solution was to use lengths.
#### What can be done better:
- I can encode a word using the lengths of the string, any character as a delimiter, and the word itself. 
- Decoding is easy now because I have to look for a number (use string math to convert it to an integer), stop looking when I see a delimiter, then construct the word after iterating through the string for length loops.
- Let's try it.

```cpp 
class Solution {
public:

    string encode(vector<string>& strs) {
        if (strs.empty()) return "";
        string s;
        for (const auto& x : strs){
            s += to_string(x.size());
            s += '#';
            s += x;
        }
        return s;
    }

    vector<string> decode(string s) {
        if (s == "") return {};
        vector<string> output;     
        int i=0;
        while (i<s.size()){
            string len_str="";
            int length = 0;
            while (s[i] != '#'){
                len_str += s[i];
                i++;
            }
            length = stoi(len_str);
            string temp = "";
            i++;
            for (int j=0; j<length; j++){
                temp += s[i];
                i++;
            }
            output.push_back(temp);
        }
        return output;
    }
};
```

- There's definitely a cleaner way to write this. 
- We can use two different methods, the latter being more readable while the former is cleaner.
- We could use `stoi` function's property of automatically finding numbers and also reporting how many characters it read. `stoi(substr(i), &n)` means: In the substring from index `i` till the end, grab the first few numbers and when you find a non-numeric character, stop and report back how many characters you consumed inside `n` (which MUST be `size_t` and not `int`).
- OR we could simply use `find('#', i)` which means return the index where you locate `'#'` after `i`. So between `i` and returned value say `j`, is the number, which we can convert to an int using `stoi(substr(i, j-i))`. `substr(pos, count)` is the syntax.
- Here's decode in both ways:
```cpp title:"Cleaner solution using substr and stoi properties"
vector<string> decode(string s){
	    if (s=="") return {};
	    vector<string> output;     
        size_t i=0;
        while (i<s.size()){
            size_t n;
            int length = stoi(s.substr(i), &n);
            i+=n+1;
            output.push_back(s.substr(i, length));
            i+=length;
        }
        return output;
    }
```
```cpp title"Readable solution using find"
vector<string> decode(string s){
	    if (s=="") return {};
	    vector<string> output;     
        size_t i=0;
        while (i<s.size()){
            size_t j = s.find('#', i);
            int length = stoi(s.substr(i, j-i));
            i = j+1;
            output.push_back(s.substr(i, length));
            i+=length;
        }
        return output;
    }
```

### 7. Products of Array except self
```cpp title:"My solution"
class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int product = 1;
        int product_wo_zero = 1;
        int zero_counter = 0;
        for (size_t i = 0; i < nums.size(); i++){
            if (nums[i]==0){
                zero_counter++;
            }
            if (zero_counter < 2) {
                if (nums[i] == 0) product *= nums[i];
                else {
                    product *= nums[i];
                    product_wo_zero *= nums[i];
                }
            }
            else {
                vector<int> meow(nums.size(), 0);
                return meow;
            }
        }
        for (int& x : nums){
            if (zero_counter == 0){
                x = product/x;
            }
            else if (zero_counter == 1){
                if (x != 0) x=0;
                else x = product_wo_zero;
            }
        }
        return nums;
    }
};
```

#### My thinking
- I knew the naive solution to be grab one element, scroll through the array, and put the values in a different vector, then return it. This was clearly O(n2), so I didn't go for it.
- Unfortunately, before I could think, the question had a follow up right in the question. "Can you solve it in O(n) without using division approach" and it clicked to me instantly that I could grab the entire product and divide it to each element. So in two passes, one for grabbing the product and another for updating the array, this would be solved.
- Boom, wrote that, then realised that zeroes are a bitch. Not just zero making everything zero, if there was only one zero, it would make every other element zero except itself. So I had to calculate a product_without_zeroes and a product (with zeroes) seperately, then according to the current num I'd replace it with the appropriate value.
- For 2 zeroes and more, the solution is trivial. All zeroes.

#### What can be made better
- Storing prefix products except current element at the current element, and similarly for postfix products, we can multiply those numbers to get the accurate answer every time.
- Each `prefix[i]` holds the product of everything before `i`, each `postfix[i]` the product of everything after `i`, so `prefix[i] * postfix[i]` is the product of all elements except `i`.

```cpp title:"Prefix and Postfix solution"
class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        vector<int> prefix(nums.size(), 1);
        vector<int> postfix(nums.size(), 1);
        for (size_t i = 1; i < nums.size(); i++){
            prefix[i] = nums[i-1]*prefix[i-1];
        }
        for (int j = nums.size()-2; j >= 0; j--){
            postfix[j] = postfix[j+1]*nums[j+1];
        }
        for (size_t i = 0; i < nums.size(); i++){
            nums[i] = prefix[i]*postfix[i];
        }
        return nums;
    }
};
```

- This can also be shortened into only two passes, without any extra space complexity. We basically store the postfix in a variable and update that in each pass over output, which already contains the prefix products after the first `for` loop.
```cpp title:"Solution in two passes"
class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        vector<int> output (nums.size(), 1);
        for (size_t i = 1; i < nums.size(); i++){
            output[i] = nums[i-1]*output[i-1];
        }
        int postfix = 1;
        for (int j = nums.size()-1; j >= 0; j--){
            output[j] *= postfix;
            postfix *= nums[j];
        }
        return output;
    }
};
```

- First solution: O(n) time, O(n) extra space (two helper arrays).
- Two-pass solution: O(n) time, O(1) extra space (auxiliary) (only the output, plus one scalar).

### 8. Valid Sudoku
```cpp title:"My solution"
class Solution {
public:
    bool isValidSudoku(vector<vector<char>>& board) {
        //i = row
        //j = col
        for (int i=0; i < 9; i++){
            unordered_map<int, int> for_row;
            unordered_map<int, int> for_col;
            for (int j=0; j < 9; j++){
                if (board[i][j] != '.'){
                    if (for_row[board[i][j]] < 1) for_row[board[i][j]]++;
                    else return false;
                }   
                if (board[j][i] != '.'){
                    if (for_col[board[j][i]] < 1) for_col[board[j][i]]++;
                    else return false;
                }
            }
        }
        unordered_map<int, unordered_map<int,int>> for_sqr;
        for (int i=0; i < 9; i++){
            for (int j=0; j < 9; j++){
                int current_sqr = (i/3)*3 + (j/3);
                if (board[i][j] != '.'){
                    if (for_sqr[current_sqr][board[i][j]] < 1){
		                for_sqr[current_sqr][board[i][j]]++;
	                } else return false;
                }
            }
        }
        return true;
    }
};
```

#### Problems I've faced
- Okay so clearly when I read the question, I was blasted by the size of the sudoku. But I knew how they worked so I did come up with the ideas of checking duplicates in rows and columns each, one pass for each in `O(n2)` time. Hash maps!
- `O(n2)` is fine actually because the sudoku board is only 9x9 meaning only 81 operations needed.
- The problem was, how do we check the 3x3 squares?? After much thought of `for` loops, I realized this needed some trick and not a brute for looping for each 3x3 square in the sudoku board.
- A looked up at a hint in the problem, and it said that I could calculate the index (between 0-8) for each 3x3 square, just by using the row and column value of the current cell. It was `(row/3)*3 + (col/3)`.
- At first I was like, wtf, how could I iterate through?
- But then, why do I have to iterate through? I could create a `hash_map` storing a `hash_map` connected to that square's index. This nested `hash_map` would be the one checking duplicates.
- But I was unsure if I would be able to code it well so I ended up doing two passes.
- I also realized I had to put the `for_row` and `for_col` in the outer loop instead of the inner loop because it forgot at every cell lmfao.
- Of course, I had early returning the moment a number went above one.
- Oh! I had to change the condition of the duplicate from `<2` to `<1` because `map[val]` creates it in the hash map, and if a duplicate is seen it will push the value from 0 to 1 directly. The moment a duplicate is seen, `<1` is false so it returns early.
- Now I'll put the square pass in the main loop so there's just ONE pass.
```cpp title:"One pass solution"
class Solution {
public:
    bool isValidSudoku(vector<vector<char>>& board) {
        //i = row
        //j = col
        unordered_map<int, unordered_map<int,int>> for_sqr;
        for (int i=0; i < 9; i++){
            unordered_map<int, int> for_row;
            unordered_map<int, int> for_col;
            for (int j=0; j < 9; j++){
                if (board[i][j] != '.'){
                    if (for_row[board[i][j]] < 1) for_row[board[i][j]]++;
                    else return false;
                }
                if (board[j][i] != '.'){
                    if (for_col[board[j][i]] < 1) for_col[board[j][i]]++;
                    else return false;
                }
                int current_sqr = (i/3)*3 + (j/3);
                if (board[i][j] != '.'){
                    if (for_sqr[current_sqr][board[i][j]] < 1) {
	                    for_sqr[current_sqr][board[i][j]]++;
	                }
                    else return false;
                }
            }
        }
        return true;
    }
};
```

#### What can be done better?
- Hashmaps are cool. But you know what's cooler? Arrays. We can access elements in literally `O(1)` time.
- Similar to storing `freq[26]` when testing anagrams, we know that the numbers in the sudoku table are between 1-9 and rows, columns, and 3x3 squares are also from 0-8 (index).
- So we could store 3 matrices: 
	- `row_count[row r][what number we looking at, n]` which tells the number of times a number n was seen in row r. 
	- `col_count[col c][what number we looking at, n]` which tells the number of times a number n was seen in col c;
	- `sqr_count[sqr s][what number we looking at n` which tells the number of times a number n was seen in sqr s.
	- `r, c, s` all range from `0-8`, and the number `n` itself too.
- Let's code it!
```cpp title:"Solution using arrays"
class Solution {
public:
    bool isValidSudoku(vector<vector<char>>& board) {
        //i = row
        //j = col
        int sqr_c[9][9] = {0};
        int row_c[9][9] = {0};
        int col_c[9][9] = {0};
        for (int i=0; i < 9; i++){
            for (int j=0; j < 9; j++){
                if (board[i][j]=='.') continue;
                
                if (row_c[i][board[i][j]-'1']==0) row_c[i][board[i][j]-'1']++;
                else return false;

                if (col_c[j][board[i][j]-'1']==0) col_c[j][board[i][j]-'1']++;
                else return false;

                if (sqr_c[(i/3)*3+(j/3);][board[i][j]-'1']==0) sqr_c[s][board[i][j]-'1']++;
                else return false;
            }
        }
        return true;
    }
};
```

### 9. Longest Consecutive Sequence
```cpp title:"My solution"
class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        
        vector<int> counts;
        unordered_map<int, int> mapp;
        for (size_t i = 0; i < nums.size(); i++){
            mapp[nums[i]] = i;
        }
        int count = 0;
        
        for (int x : nums){
            if (mapp.find(x-1)==mapp.end()){
                count++;
                while (mapp.find(x+1) != mapp.end()){
                    count++;
                    x = x+1;
                }
                counts.push_back(count);
                count=0;
            }
        }

        int maxi = 0;
        for (int x : counts){
            maxi = max(x, maxi);
        }
        return maxi;
    }
};
```

#### Problems I faced
- Upon seeing the requirement of the solution in O(n) and the obvious solution that came to mind was O(n2), I didn't want to use nested loops.
- So? I tried to go for one `for` loop where I would change the index based on what next element I found.
- After writing it's code, I realized that messing with indexes in `for` loops is almost ALWAYS bound for error. Because the condition that leaves the `for` loop is never coded inside the for loop manually (like in `while`) but is *included* in the `for` loop.
- Clearly, my solution was failing due to forever looping and reaching TLE.
- First example should have passed on my code `[2,20,4,10,3,4,5]` because when we reached the final element `5` i++ would have escaped the for loop. YET somehow my count value kept being 0 for some reason.
- Knowing well this wasn't going to work, I looked up whether this problem with a nested loop would truly be O(n2) or not. 
- I was looking for the worst case, something like `[1, 3, 5, 7]` or `[1,2,4,5,7,8]` and was thinking that this would for `n*n/2` times. But reimagining it by writing it down, we ONLY get in the loop for specific elements, and run the nested loop ONCE for each number. Meaning each number is visited only ONCE. aka, O(n).
- Coded it, got it running.
- Didn't face syntax issues much this time.

#### Why it works?
- This solution is O(n) in both time and space, because the extra set we created consumes the space as n grows. Time because each element is visited once. But why?
- You see, we only start checking the consecutive-ness of elements IF we know that they are the start of that sequence. We check that by trying to find the number *before* the element and if there's none, it would be the first of its possible list.
- Then we use the while loop to visit the elements of its consecutive list.
- Then the outer loops moves forward, but doesn't initiate the inner loop since the consecutive elements (that aren't the first element) will not be considered as a new list to discover. They only get visited because they had a first element before them.
- So assuming there are `n` elements in `nums`, then the outer loop does run `n` times. But the inner loop only runs when we find a *first* element, which reads the next say `y` consecutive elements (y operations). So each *first* element starts `y` operations. The *middle* elements don't, so only 1 operation for them (the outer loop). We only start looking for middle elements AFTER a first element existed. MEANING we only do `n` operations + `at most n` operations for each first element we found. This isn't `n*(at most n)` but `n+ (at most n)` which is basically, O(n).
- *Every element is walked by an inner while loop **at most** once, ever, across the entire run.*
- *Because each number belongs to exactly one consecutive sequence, and that sequence is walked exactly once, from its unique start.*

#### What can be made better?
- Instead of saving it in a hash_map (which stored the index earlier and was useless here because we only want validity of presence of a number) we can store it in an unordered_set. We still have O(1) lookups, and no duplicates.
- Directly copy elements by using the syntax `unordered_set<int> mapp(nums.begin(), nums.end())` man these hacks are nuts. This is same as a `for` loop (O(n)) but saves me from writing a for loop.
- Anyways, instead of saving things in a vector, we can update a variable of best_count and return that. Saves space complexity and an extra `for` loop.
- Here's the final code:
```cpp
class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        
        unordered_set<int> mapp(nums.begin(), nums.end());
        int best_count = 0;
        
        for (int x : mapp){
            if (mapp.find(x-1)==mapp.end()){
                int count=1;
                int curr = x;
                while (mapp.find(curr+1) != mapp.end()){
                    count++;
                    curr = curr+1;
                }
                best_count=max(best_count, count);
            }
        }

        return best_count;

    }
};
```

