price = float(input("ราคาต่อชิ้น (บาท): "))
qty = int(input("จำนวนชิ้น: "))
total = price * qty
print(f"ยอดรวม {total:.2f} บาท")
paid = float(input("รับเงินมา (บาท): "))
change = paid - total
print(f"เงินทอน {change:.2f} บาท")
