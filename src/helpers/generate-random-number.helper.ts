export class RandomNumberGenerator {
  public static generate(): number {
    return Math.floor(10000000 + Math.random() * 90000000);
  }
}
