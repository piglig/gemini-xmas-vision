#!/bin/bash

# 进入 assets 目录
cd "$(dirname "$0")/assets" || exit

echo "正在重命名 assets 目录中的图片..."

# 计数器
count=1

# 查找所有 jpg, jpeg, png, HEIC, JPG, PNG 等常见图片格式
# 使用 sort 确保顺序相对稳定 (虽然 ls 默认排序，但明确一下更好)
# find . -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.heic" \) | sort | while read file; do
# 为了处理文件名带空格等情况，使用更健壮的循环方式

# 先将所有文件重命名为一个临时前缀，防止覆盖已有的 1.jpg, 2.jpg 等
# 例如：如果有 1.jpg, 2.jpg, img.jpg，直接重命名 img.jpg -> 3.jpg 没问题
# 但如果有 3.jpg, img.jpg，重命名 3.jpg -> 1.jpg 可能会冲突如果还没处理到 1.jpg
# 最简单的方法：先全部加上 temp_ 前缀
for file in *; do
    # 跳过如果不是文件
    [ -f "$file" ] || continue
    
    # 获取扩展名 (小写)
    ext="${file##*.}"
    ext=$(echo "$ext" | tr '[:upper:]' '[:lower:]')

    # 检查是否是图片扩展名
    if [[ "$ext" == "jpg" || "$ext" == "jpeg" || "$ext" == "png" || "$ext" == "heic" ]]; then
        mv "$file" "temp_${file}"
    fi
done

# 现在按顺序重命名为 1.jpg, 2.jpg ...
# 注意：这里我们统一转换为 .jpg 后缀，因为 index.html 代码里写死了 .jpg
# 如果需要支持 png，需要修改 index.html 的逻辑。
# 这里为了配合你的项目，我将尝试将它们都视为 jpg (直接改后缀通常浏览器也能识别，或者转换)
# 为了稳妥，仅仅是改名，如果原图是 png，直接改 .jpg 后缀，浏览器通常也能渲染。

for file in temp_*; do
    # 如果没有匹配到文件，跳过
    [ -e "$file" ] || continue

    # 获取扩展名
    # ext="${file##*.}"
    
    # 新文件名：序号.jpg
    new_name="${count}.jpg"
    
    mv "$file" "$new_name"
    echo "重命名: $file -> $new_name"
    
    ((count++))
done

echo "完成！共处理 $((count-1)) 张图片。"
