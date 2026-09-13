# רועי קובובסקי, עורכי דין — אתר המשרד

אתר סטטי, ללא תלות בשרת או ב-build. שישה עמודים, RTL מלא, עיצוב שחור-לבן.

---

## הרצה מקומית

### Windows

1. חלץ את ה-ZIP: לחיצה ימנית על הקובץ → **Extract All** → Extract.
2. היכנס לתיקייה שנוצרה ב-File Explorer, עד שאתה רואה את `index.html`.
3. לחץ על שורת הכתובת למעלה, מחק מה שכתוב בה, הקלד `cmd` ו-Enter.
   נפתח חלון פקודה **שכבר נמצא בתיקייה הנכונה**.
4. הרץ:

```
npx serve
```

פתח בדפדפן את הכתובת שמודפסת על המסך (בדרך כלל `http://localhost:3000`).
לעצירה: `Ctrl+C`.

> **חשוב ב-Windows:** בשורת הפקודה אין הערות. אל תעתיק טקסט אחרי הפקודה —
> הוא ייחשב לחלק ממנה ויגרום לשגיאה.
> `python3` לא קיים ב-Windows; השתמש ב-`npx serve` ולא ב-`serve.py`.

### Mac / Linux

```
python3 serve.py
```

או `npm run dev`.

> אל תפתח את `index.html` בלחיצה כפולה. הדפדפן חוסם חלק מהדברים תחת `file://`.
> תמיד דרך שרת מקומי.

---

## פרסום ל-Vercel

### הדרך המהירה — פקודה אחת

מתוך תיקיית הפרויקט (ב-Windows: אותו חלון cmd מהשלב הקודם, אחרי `Ctrl+C`):

```
npx vercel
```

בפעם הראשונה זה יבקש התחברות (נפתח דפדפן), ואז ישאל כמה שאלות:

| שאלה | תשובה |
|---|---|
| Set up and deploy? | `y` |
| Which scope? | החשבון שלך |
| Link to existing project? | `n` |
| Project name? | `kubovsky` |
| In which directory is your code? | `./` |
| Modify settings? | `n` |

בסוף תקבל לינק. כדי לפרסם לכתובת הקבועה (production):

```
npx vercel --prod
```

### הדרך דרך GitHub — מומלץ לטווח ארוך

כך כל `git push` מפרסם אוטומטית.

יצירת הריפו ב-GitHub — דורש GitHub CLI מותקן:

```
gh repo create kubovsky-site --private --source=. --remote=origin --push
```

בלי `gh`? צור ריפו ריק ב-github.com/new בשם `kubovsky-site`, ואז:

```
git remote add origin https://github.com/USERNAME/kubovsky-site.git
git branch -M main
git push -u origin main
```

אחר כך ב-`vercel.com/new` → Import Git Repository → בחר את `kubovsky-site` → Deploy.
אין מה להגדיר: אין build command, אין output directory. זה אתר סטטי.

---

## דומיין

ב-Vercel: Project → Settings → Domains → הוסף `kubovsky.co.il`.
Vercel יציג אילו רשומות DNS להוסיף אצל רשם הדומיין.

אחרי שיש דומיין, החלף את `REPLACE-WITH-YOUR-DOMAIN` בקבצים `robots.txt` ו-`sitemap.xml`.

---

## מבנה

```
index.html        עמוד הבית — הירו, סרט נע, אמירה, ציטוטים
about.html        אודות
practice.html     תחומי עיסוק
faq.html          שאלות נפוצות
contact.html      צרו קשר + טופס
terms.html        תקנון ומדיניות פרטיות
assets/style.css  כל העיצוב — משותף לכל העמודים
assets/app.js     כל האינטראקציות — משותף לכל העמודים
vercel.json       הגדרות פרסום ו-headers
serve.py          שרת מקומי
```

**שינוי עיצוב אחד משנה את כל האתר** — הכל ב-`assets/style.css`.
תוכן טקסטואלי נמצא בקובץ ה-HTML של העמוד הרלוונטי.

---

## תמונות

האתר מחפש שני קבצים שעדיין לא קיימים:

- `assets/roey-hero.jpg` — פס אנכי בעמוד הבית. יחס 3:4.3, רצוי 800×1150 ומעלה.
- `assets/roey-portrait.jpg` — פורטרט בעמוד אודות. יחס 4:5, רצוי 900×1125 ומעלה.

בינתיים נטענת תמונת גיבוי באיכות נמוכה. **זה הפער המשמעותי היחיד שנשאר באתר.**
צילום סטודיו בשחור-לבן על רקע אחיד ישנה את הרושם יותר מכל שינוי עיצובי.

אפשר להוסיף גם `assets/logo.svg` אם רוצים להחליף את שם המשרד הכתוב בלוגו גרפי.

---

## טופס יצירת הקשר

הפניות נשלחות בשתי דרכים במקביל:

1. **מייל** דרך FormSubmit אל הכתובת שמוגדרת ב-`SITE_CONFIG.formEmail`.
   בפעם הראשונה שנשלחת פנייה, FormSubmit שולח מייל אימות — **צריך ללחוץ על הקישור בו**,
   אחרת פניות לא יגיעו.
2. **גיבוי** בטבלת `roey_leads` ב-Supabase.

אם שתיהן נכשלות, נפתחת תוכנת המייל של הגולש כגיבוי אחרון.

ההגדרות נמצאות בתחתית כל קובץ HTML, בבלוק `window.SITE_CONFIG`.

---

## נגישות

ניווט מקלדת מלא, `aria-current` בתפריט, סימון פוקוס גלוי, וכיבוד `prefers-reduced-motion`
(מי שהגדיר במערכת ההפעלה הפחתת תנועה מקבל את האתר בלי אנימציות).

## לפני עלייה לאוויר

- [ ] עורך דין עובר על `terms.html` — במיוחד סעיף הפרטיות
- [ ] אימות FormSubmit בוצע ונבדק שפנייה מגיעה
- [ ] הוחלפו שתי התמונות
- [ ] נבדק במובייל אמיתי, לא רק בהקטנת חלון
