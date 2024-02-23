import { applyUserWeight, redistributeAmounts } from "./distributeWeights";

describe("Distribute weights", () => {
  it("Modify index 3 with 50", () => {
    const weights = [10, 20, 18, 12, 15, 15, 5, 5];
    const newWeights = applyUserWeight(weights, [0, 0, 0, 30, 0, 0, 0, 0]);
    const total = newWeights.reduce((acc, x) => acc + x);
    expect(newWeights[3]).toBe(30);
    expect(total.toFixed(0)).toBe("100");
  });

  it("Update from 20 to 50 weight with index 1", () => {
    const weights = [10, 20, 0, 12, 15, 15, 5, 5];
    const newWeights = applyUserWeight(weights, [0, 50, 0, 0, 0, 0, 0, 0]);
    const total = newWeights.reduce((acc, x) => acc + x);
    expect(newWeights[1]).toBe(50);
    expect(newWeights[2]).toBe(0);
    expect(total.toFixed(0)).toBe("100");
  });

  it("Update from 10 to 33 weight with index 0", () => {
    const weights = [10, 20, 0, 0, 15, 15, 5, 5];
    const newWeights = applyUserWeight(weights, [33, 0, 0, 0, 0, 0, 0, 0]);
    const total = newWeights.reduce((acc, x) => acc + x);
    expect(newWeights[0]).toBe(33);
    expect(newWeights[2]).toBe(0);
    expect(newWeights[3]).toBe(0);
    expect(total.toFixed(0)).toBe("100");
  });

  it("Persist already added weight", () => {
    const weights = [33, 12, 0, 0, 15, 15, 5, 5, 15];
    const newWeights = applyUserWeight(weights, [33, 0, 0, 0, 20, 0, 0, 0, 0]);
    const total = newWeights.reduce((acc, x) => acc + x);
    expect(newWeights[0]).toBe(33);
    expect(newWeights[4]).toBe(20);
    expect(total.toFixed(0)).toBe("100");
  })

  it("Handle the addition of .1 to a weight", () => {
    const weights = [33, 12, 0, 0, 15, 15, 5, 5, 15];
    const newWeights = applyUserWeight(weights, [33.1, 0, 0, 0, 0, 0, 0, 0, 0]);
    const total = newWeights.reduce((acc, x) => acc + x);
    expect(newWeights[0]).toBe(33.1);
    expect(newWeights[1]).toBe(11.982089552238806);
    expect(newWeights[2]).toBe(0);
    expect(total.toFixed(0)).toBe("100");
  })

  it("Add one percentage as 100%", () => {
    const weights = [10, 20, 0, 12, 15, 15, 5, 5];
    const newWeights = applyUserWeight(weights, []);
    const total = newWeights.reduce((acc, x) => acc + x);
    expect(newWeights[1]).toBe(100);
    expect(total.toFixed(0)).toBe("100");
  });

  it("Redistribute pre-defined weights", () => {
    const weights = [10, 30, 10, 40, 10];
    const selectedWeights = [true, true, false, false, true];
    const newWeights = redistributeAmounts(weights, selectedWeights);
    expect([0.2, 0.6, 0, 0, 0.2].toString()).toBe(newWeights.toString());
  });

  it("Redistribute fails if weights and selected weights arrays does not have the same size", () => {
    expect(() => redistributeAmounts([1], [])).toThrow("Selected weights and default weights must have the same size");
  });
});
