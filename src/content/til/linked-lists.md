---
title: "Linked Lists"
date: 2026-06-22
tags: ["C++", "DSA"]
---

## Introduction
- Array stores data in continuous or contiguous memory.
- All accessible in O(1) time, because it directly reaches address of elements inside by simple arithmetic, BECAUSE they are all stored together.
- But, there's problems with this contiguous memory is that when there's no space for the next element you must copy the elements to a new location, wasting time.
- That's why we use linked lists because it stores it's data in random places of the memory and each are connected.

## Linked Lists
- Stores data in Nodes that are spread out in memory but all nodes are storing address of the next node in the list.
- Traversal time complexity: O(n)
- Insertion time complexity: O(n)
!["Meow"](/public/images/Pasted%20image%2020260622201004.png)

## Arrays vs linkedlists
### a) Cost of Accessing an element
- Array needs constant time O(1) because simple arithmetic leads to the next element.
- Address of i th element = Base_address + i * Size_of_data_type
- Linked List needs O(n) where is n is number of elements in the list.

### B) Memory Requirement
- Array has a fixed size, so partially filled array takes as much space as it was full.
- So there's a lot of unused space in memory.
- Sometimes, memory may not be available all the time since contiguous memory so it requires copying of data.

- Linked List requires extra memory for pointer variables. They are 4 bytes each (in 32bit system). But 8 bytes in 64bit system.
- But it does not leave unused memory.
- It's usually better than array when the datatype being stored has higher size. But depends on the case on which performs better.
- Nodes being stored at random places in memory.

### C) Cost of insertion
1. **In the beginning**
	- Arrays have to shift all elements by one and then insert the value at starting. So O(n)
	- Linked List disconnects head node and reattaches new node in the beginning. So O(1)
2. **In the end**
	- Arrays: Just insert element at the new free location, or copy into new array if it is full. So O(1) or O(n)
	- Linked List needs to traverse until the end then attach new node. So O(n)
3. **At i-th location (average case)**
	- Arrays: Shift some elements forward. So O(n)
	- Linked list: Traverse i elements, so O(n)

## Implementation in both C and C++

**Making a node**
```c
typedef struct Node{
	int data;
	struct Node* next;
} Node;
```
```cpp
struct Node{
	int data;
	Node* next;
};
```

**Initializing Linked List**
```c
Node* A; //initialising empty LL
A = NULL; //Setting it as Null initially
Node* temp = (Node*) malloc(sizeof(struct Node)) //typecasting required, creating a new temporary node
(*temp).data = 2; //Filling data in node
(*temp).next = NULL; //Attaching it to null address
A = temp; //Setting A as temp node
```

```cpp
Node* A;
A = NULL;
Node* temp = new Node();
temp->data = 2;           // -> is basically short form of the deferencing (*) and accessing structure with .
temp->next = NULL;
A = temp;
```

```c++ title:"Inserting element at end"
Node* temp1 = A;
while (temp->next != NULL){
	temp1 - temp1 -> next;
}

temp = new Node();
temp->data = 4;
temp->next = NULL;
temp1->next = temp;
```

```c title:"Inserting a node in the beginning"
#include <stdlib.h>
#include <stdio.h>

typedef struct Node {
	int data;
	struct Node* next;
} Node;

void Insert(Node** pointerToHead, int x);
void Print(Node* head);

int main(){
	struct Node* head = NULL;
	int n,x;
	printf("Enter number of nodes: ")
	scanf("%d", &n);
	for (int i=0; i < n; i++){
		printf("Enter a number: ");
		scanf("%d", &x);
		Insert(&head, x);
		Print(head);
	}
	printf("\n");
}

void Insert(Node** pointerToHead, int x){
	Node* temp = (Node*) malloc(sizeof(struct Node));
	temp->data = x;
	temp->next = *pointerToHead;
	*pointerToHead = temp;
}

void Print(Node* head){
	while (head != NULL){
		printf("%d ",head->data);
		head = head->next;
	}
	printf("\n");
}
```

Notes:
- Node** is a pointer to pointer. Dereferencing it gives us the pointer to a Node. Then we can use -> to grab its data and next
- We used pointer-to-pointer so that we can modify what is at the address of the memory. If we used pointer directly, that would not work because this new argument inside Insert would be a COPY of the pointer and not the one we want to modify.
- Insert function handles both empty and non-empty linked list as if it is empty then head is null which the new temp node takes anyways.
- For C++ we can use classes and the new function (Node* temp = new Node();) for easy.
- This code still doesn't free up memory.