def matrix(m,n):
    o = []
    for i in range(m):
        row = []
        for j in range(n):
            inp = int(input(f"Enter o[{i}][{j}]: "))
            row.append(inp)
        o.append(row)
    return o

m = int(input("Enter number of rows: "))
n = int(input("Enter number of columns: "))

# print("Enter matrix A: ")
# A = matrix(m, n)

# # print(A)

# print("Enter matrix B: ")
# B = matrix(m, n)

a = [[0] * n for _ in range(m)] 
for i in range(m):
    for j in range(n):
        a[i][j] = 0

for i in range(m):
    print("\n")
    for j in range(n):
        print(a[i][j], end = " ")

# for i in range(m):
#     for j in range(n):
#         a[i][j] = A[i][j] + B[i][j]
