# ĐẠO TÀNG NHÂN GIỚI XML 2.0

## Nguyên tắc bắt buộc

1. Mọi file dùng `id` ổn định; code và XML chỉ tham chiếu bằng ID.
2. `Monsters.xml` tự khai `lootTableId`, không dùng `MonsterRef` trong LootTables.
3. `LootTables.xml` chỉ chứa tỷ lệ rơi; không lặp tên, giá hoặc phẩm chất vật phẩm.
4. Mọi vật phẩm phải được định nghĩa trong `VatPham/*.xml`.
5. Mọi phần thưởng dùng chung nút `<Reward type="..."/>`.
6. Linh Thạch là tiền tệ, không chiếm ô Túi Càn Khôn.
7. Bản đồ chỉ tham chiếu `MonsterRef`, `NPCRef`, `NodeRef`, `EventPoolRef`.
8. Tất cả phần thưởng vật phẩm phải đi qua InventoryService.

## Chuẩn Reward

```xml
<Reward type="currency" currencyId="linh_thach" min="1" max="3"/>
<Reward type="experience" path="body" amount="5"/>
<Reward type="item" itemId="lang_nha" min="1" max="2"/>
<Reward type="status" statusEffectId="noi_thuong"/>
<Reward type="unlock" targetId="bi_canh_so_khai"/>
```

## Chuẩn Item

```xml
<Item id="" name="" category="" subCategory=""
      qualityId="pham" stackLimit="999" sellPrice="0"
      tradable="true" usable="false">
  <Description/>
  <UseEffect type="" />
</Item>
```

## Chuẩn Monster

```xml
<Monster id="" name="" rank="normal" level="1"
         lootTableId="loot_xxx" skillSetId="skillset_xxx">
  <Stats hp="" attack="" defense="" speed="" crit="" dodge=""/>
  <Rewards>
    <Reward type="currency" currencyId="linh_thach" min="" max=""/>
    <Reward type="experience" path="body" amount=""/>
  </Rewards>
</Monster>
```

## Quan trọng

Bộ XML này là kiến trúc 2.0. Backend cũ phải được cập nhật loader/runtime để đọc:
- Module.xml
- lootTableId trực tiếp trên Monster
- Reward dạng danh sách
- qualityId
- skillSetId
