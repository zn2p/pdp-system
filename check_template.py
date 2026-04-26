import re

def get_template(path):
    content = open(path, encoding="utf-8").read()
    idx1 = content.index("`")
    idx2 = content.rindex("`")
    return content[idx1+1:idx2]

login = get_template("frontend/modules/templates/login.js")
student = get_template("frontend/modules/templates/student.js")
teacher = get_template("frontend/modules/templates/teacher.js")
modals = get_template("frontend/modules/templates/modals.js")

outer_raw = open("frontend/modules/template.js", encoding="utf-8").read()
idx1 = outer_raw.index("`")
idx2 = outer_raw.rindex("`")
outer_tpl = outer_raw[idx1+1:idx2]

# Simulate JS template literal interpolation
full = outer_tpl.replace("${loginTemplate}", login)
full = full.replace("${studentTemplate}", student)
full = full.replace("${teacherTemplate}", teacher)
full = full.replace("${modalsTemplate}", modals)

print(f"Template lengths: login={len(login)}, student={len(student)}, teacher={len(teacher)}, modals={len(modals)}")
print(f"Full template length: {len(full)}")

# Check div balance
for name, tmpl in [("login", login), ("student", student), ("teacher", teacher), ("modals", modals), ("full", full)]:
    opens = len(re.findall(r"<div[\s>]", tmpl))
    closes = len(re.findall(r"</div>", tmpl))
    status = "OK" if opens == closes else "MISMATCH"
    print(f"{status}: {name} div balance: opens={opens}, closes={closes}")

# Check v-if/v-else presence around login
vi_pos = full.find('v-if="!isLoggedIn"')
ve_pos = full.find('v-else class="app-layout"')
print(f"\nv-if login pos: {vi_pos}, v-else app-layout pos: {ve_pos}")
between = full[vi_pos:ve_pos]
print(f"Characters between v-if and v-else (first 100 after </div>): {repr(between[-50:])}")

# Look for any ${} that wasn't substituted
remaining = re.findall(r'\$\{[^}]+\}', full)
if remaining:
    print(f"\nWARNING: Unsubstituted ${{}} found: {remaining[:5]}")
else:
    print("\nNo unsubstituted ${} found")

# Write full template to file for inspection
with open("full_template_debug.html", "w", encoding="utf-8") as f:
    f.write(full)
print("\nFull template written to full_template_debug.html")
