while True:
    price = float(input("ราคาต่อชิ้น (บาท, 0 = ปิด): "))
    if price == 0:
        print("ปิดโปรแกรม")
        break
    qty = int(input("จำนวนชิ้น: "))
    total = price * qty
    if total >= 2000:
        discount = total * 15 / 100
    elif total >= 1000:
        discount = total * 10 / 100
    elif total >= 500:
        discount = total * 5 / 100
    else:
        discount = 0
    pay = total - discount
    print(f"ยอดรวม {total:.2f} บาท · ส่วนลด {discount:.2f} บาท · ต้องจ่าย {pay:.2f} บาท")
