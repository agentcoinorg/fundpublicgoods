from fund_public_goods.lib.strategy.utils.utils import adjust_weights

def test_adjust_weights_small_dif():
    weights_a = [0.15, 0.14, 0.12, 0.11, 0.15, 0.08, 0.15, 0.12, 0.08]
    assert sum(adjust_weights(weights_a)) == 1
    weights_b = [0.23, 0.16, 0.20, 0.18, 0.19, 0.05, 0.02, 0.03]
    assert sum(adjust_weights(weights_b)) == 1.0000000000000002



def test_adjust_weights_big_dif():
    weights = [0.14, 0.15, 0.11, 0.11, 0.13, 0.09, 0.11, 0.12, 0.13, 0.10]
    new_weights = adjust_weights(weights)
    assert new_weights == [0.13, 0.13, 0.09, 0.09, 0.11, 0.07, 0.09, 0.1, 0.11, 0.08]
    assert sum(new_weights) == 0.9999999999999998
    # we round because the result is 0.9999999999999998 and that's ok
    assert round(sum(new_weights)) == 1
