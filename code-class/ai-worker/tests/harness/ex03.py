def my_min(history):
    smallest = history[0]
    for amount in history:
        if amount < smallest:
            smallest = amount
    return smallest

print(my_min([570, 900, 120]))

def has_bill(history, amount):
    for bill in history:
        if bill == amount:
            return "พบ"
    return "ไม่พบ"

print(has_bill([570, 900, 120], 900))
print(has_bill([570, 900, 120], 50))
