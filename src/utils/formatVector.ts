export function toPgVector(embedding: number[]): string {
    // pgvector requires bracketed string format
    return `[${embedding.join(",")}]`;
}