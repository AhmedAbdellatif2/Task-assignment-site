from fpdf import FPDF

pdf = FPDF()
pdf.add_page()
pdf.set_font('Arial', 'B', 16)
pdf.cell(0, 10, 'Django _admin App Endpoints', ln=True, align='C')
pdf.ln(10)
pdf.set_font('Arial', '', 12)

endpoints = [
    ('/','SignUp','GET, POST','Signup page and registration logic'),
    ('/login/','Login','GET, POST','Login page and authentication'),
    ('/dashboard/','Dashboard','GET','Admin dashboard page'),
    ('/tasks/','Tasks','GET','Admin tasks page'),
    ('/editpage/','EditPage','GET','Admin edit page'),
    ('/profile/','Profile','GET','Profile page'),
    ('/settings/','Settings','GET','Settings page'),
    ('/search/','Search','GET','Search page'),
    ('/teacher_task/','teacher_task','GET','Teacher task page'),
    ('/teachers_task_list/','teachers_task_list','GET','Teachers task list page'),
]

# Table header
pdf.set_font('Arial', 'B', 12)
pdf.cell(45, 8, 'URL Path', 1)
pdf.cell(35, 8, 'View Function', 1)
pdf.cell(30, 8, 'Methods', 1)
pdf.cell(80, 8, 'Description', 1, ln=True)

pdf.set_font('Arial', '', 12)
for url, view, methods, desc in endpoints:
    pdf.cell(45, 8, url, 1)
    pdf.cell(35, 8, view, 1)
    pdf.cell(30, 8, methods, 1)
    pdf.cell(80, 8, desc, 1, ln=True)

pdf.output('admin_app_endpoints.pdf')
print('PDF generated: admin_app_endpoints.pdf')
