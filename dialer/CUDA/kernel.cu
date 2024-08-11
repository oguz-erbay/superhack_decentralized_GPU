#include <stdio.h>

#define N 16  // Matris boyutu (NxN)

// CUDA kernel fonksiyonu
__global__ void matrixMultiply(int* A, int* B, int* C, int n) {
    int row = blockIdx.y * blockDim.y + threadIdx.y;
    int col = blockIdx.x * blockDim.x + threadIdx.x;

    int sum = 0;
    if (row < n && col < n) {
        for (int i = 0; i < n; ++i) {
            sum += A[row * n + i] * B[i * n + col];
        }
        C[row * n + col] = sum;
    }
}

int main() {
    int size = N * N * sizeof(int);
    int A[N][N], B[N][N], C[N][N];  // Host matrisler

    // Matrisleri doldur (örnek veriler)
    for (int i = 0; i < N; ++i) {
        for (int j = 0; j < N; ++j) {
            A[i][j] = i + j;
            B[i][j] = i - j;
            C[i][j] = 0;
        }
    }

    int *d_A, *d_B, *d_C;

    // Device (GPU) hafızası ayır
    cudaMalloc((void**)&d_A, size);
    cudaMalloc((void**)&d_B, size);
    cudaMalloc((void**)&d_C, size);

    // Matrisleri GPU'ya kopyala
    cudaMemcpy(d_A, A, size, cudaMemcpyHostToDevice);
    cudaMemcpy(d_B, B, size, cudaMemcpyHostToDevice);

    // Kernel çağrısı (her blokta 16x16 thread)
    dim3 threadsPerBlock(16, 16);
    dim3 blocksPerGrid((N + threadsPerBlock.x - 1) / threadsPerBlock.x, 
                       (N + threadsPerBlock.y - 1) / threadsPerBlock.y);
    matrixMultiply<<<blocksPerGrid, threadsPerBlock>>>(d_A, d_B, d_C, N);

    // Sonucu GPU'dan geri al
    cudaMemcpy(C, d_C, size, cudaMemcpyDeviceToHost);

    // Sonucu ekrana yazdır (isteğe bağlı)
    printf("RESULT MATRIX:\n");
    for (int i = 0; i < N; ++i) {
        for (int j = 0; j < N; ++j) {
            printf("%d ", C[i][j]);
        }
        printf("\n");
    }

    // GPU hafızasını temizle
    cudaFree(d_A);
    cudaFree(d_B);
    cudaFree(d_C);

    return 0;
}
