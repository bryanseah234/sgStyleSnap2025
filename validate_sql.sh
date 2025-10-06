#!/bin/bash
echo "========================================"
echo "SQL FILES VALIDATION"
echo "========================================"
echo ""

for file in sql/*.sql; do
    echo "📄 $(basename $file)"
    
    # Count parentheses
    open=$(grep -o '(' "$file" | wc -l)
    close=$(grep -o ')' "$file" | wc -l)
    
    if [ "$open" -eq "$close" ]; then
        echo "  ✅ Parentheses balanced ($open pairs)"
    else
        echo "  ❌ Unmatched parentheses: $open open, $close close"
    fi
    
    # Check for double semicolons
    double_semi=$(grep -c ';;' "$file" || true)
    if [ "$double_semi" -eq 0 ]; then
        echo "  ✅ No double semicolons"
    else
        echo "  ⚠️  Found $double_semi double semicolons"
        grep -n ';;' "$file" | head -3
    fi
    
    # Check for common typos
    if grep -q 'CRAETE\|ATLER\|SELCT\|FORM\s' "$file"; then
        echo "  ⚠️  Possible typos found"
    fi
    
    echo ""
done

echo "========================================"
echo "✅ Basic validation complete"
echo "========================================"
