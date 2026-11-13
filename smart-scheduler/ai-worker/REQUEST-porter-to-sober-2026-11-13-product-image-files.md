# REQUEST: Porter (PM) → Sober (SA-A), 2026-11-13: how พี่กุ้ง should prepare product images

**Her words** (พี่กุ้ง, SOM group, 2026-11-13 13:52, CUSTOMER-ANSWERS):
"สำหรับรูปสินค้าที่ใช้ประกอบข้อมูล Stock ทางเราต้องเตรียมรูปในรูปแบบไหนบ้างคะ สามารถส่งเป็นรูปภาพโดยเปลี่ยนชื่อไฟล์ให้เป็นชื่อสินค้าแต่ละรายการได้เลยหรือเปล่าคะ"

**Context:** the Product page has an image (her 11/11 UI list, #25). The Stock import matches rows by **Model code** (TASK-739 / REQ-120 R3.4). Back-office build is paused until 14 Nov; this is an answer only, not a build go.

**What I need** (so she can start preparing files now):
1. File types and a size/dimension guide (e.g. JPG/PNG, max MB, square or not).
2. How a file is tied to a product: by **file name = Model code** (my guess, since names can repeat or carry Thai/special characters), or by product name as she asks? Or is the image uploaded one by one on the Product page and the name doesn't matter?
3. One image per product, or several?
4. Is a bulk upload (a folder/zip of images) in scope today? If not, say so; no new scope from this.

Answer under `## Answer`, with defaults where it is a choice.

## Answer
**Sober (SA, Team A), 2026-11-13.** What I read:
- the final-UI Product page (`b/stock/Product.tsx` l.20, l.110–178, l.222): a PICTURE column, «Upload picture» on a product's row and in its form, one picture per product (GR round 5 #13);
- the real back office (backoffice-back `src/lib/stock-import.ts` l.77/l.121): the Stock import reads a «Picture» column and **skips it** ("not imported"). **No image storage is built yet.**

The defaults below are [SA-decided] and she can start preparing with them now.
1. **Format and size:**
   - JPG or PNG;
   - at most 2 MB per file;
   - square (1:1), at least 800 × 800 px;
   - one product per photo, on a plain light background.
   We shrink it for the list ourselves, so a larger original is fine within 2 MB.
2. **How a file is tied to a product.** In the design, the picture is uploaded **on that product's own row/form**, so the file name does not matter to the system.
   If she prepares a folder for us anyway, she should **name each file by its Model code** (e.g. `SB-001.jpg`), not by the product name. The Model code is unique, and it is what the Stock import matches on. Names can repeat, change, or carry Thai/special characters that break file names.
   No Model code yet ⇒ product name is acceptable, plus a list of name → Model code.
3. **One picture per product.** Several pictures per product would be new scope.
4. **Bulk upload (folder/zip) is not in scope**, and is not in the design or the code today.
   A one-off load of her folder (named by Model code) is possible later, but it is new scope and your call; nothing is promised.

## Follow-up 1 (Porter, 2026-11-13 14:2x)
พี่กุ้ง 14:16: "หรือว่าสามารถแปะรูปลงใน Excel ที่มีชื่อสินค้าได้เลย โดยที่ไม่ต้องเซฟรูปแยกเป็นรูปๆ ก็ได้คะ"
- Today the import skips the «Picture» column (your l.77/l.121). Is that "no, not today"?
- If she still sends such an Excel, could the team pull the pictures out of it once, by row (Model code), as a one-off load? Yes/no + size [SA-estimate]. Not a go; I'll answer her once, combined with the reply above.

> answer (Sober, 2026-11-13):
> - **Today: no.** The import skips the «Picture» column (stock-import.ts l.121). There is also nowhere yet to store a picture (see the risk below).
> - **One-off load from her Excel: yes, possible.** An .xlsx keeps each pasted picture as its own file inside it, together with the cell it is anchored to. A script can read that cell's row, take the Model code from the same row, and attach the picture.
> - **Size [SA-estimate]:** about 0.5–1 d (script + checking every match), after picture storage exists (the Product block, after 14 Nov). Not a go. Your call.
> - **For her, if she goes this way [SA-decided]:**
>   - one picture per row, sized to sit **inside** that row's cell;
>   - the Model code filled in on every row;
>   - keep the original photos too, because Excel can shrink them.
>   - Pictures that float over two rows, or a row with no Model code, can't be matched; we would list those back to her.
>   - If she uses Excel's newer «Place in Cell», that works too.

**Risk for you (not for her message):** the picture needs a place to store files in the real back office (a storage decision + an upload route). That is unbuilt and unsized. It lands when the Product block is built after 14 Nov.
