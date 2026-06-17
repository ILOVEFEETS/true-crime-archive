from pathlib import Path
import json

categories = [
    'Mord & Tötungsdelikte',
    'Serienmörder',
    'Entführungen',
    'Verschwörungen',
    'Ungeklärte Fälle',
    'Familienverbrechen',
    'Medienfälle',
    'Politische Verbrechen'
]

prefixes = [
    'Der Fall',
    'Die Akte',
    'Der Mord an',
    'Die Nacht von',
    'Das Rätsel um',
    'Die Spur nach',
    'Die Wahrheit über',
    'Der Tod von'
]

locations = [
    'Boston', 'Los Angeles', 'New York', 'Chicago', 'Seattle', 'Miami', 'Dallas',
    'Phoenix', 'Denver', 'Atlanta', 'Houston', 'San Diego', 'Portland', 'Austin',
    'Jacksonville', 'San Jose', 'Columbus', 'Fort Worth', 'Indianapolis', 'Charlotte',
    'San Francisco', 'Memphis', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson',
    'Fresno', 'Mesa', 'Sacramento', 'Kansas City', 'Raleigh', 'Omaha', 'Long Beach',
    'Virginia Beach', 'Oakland', 'Minneapolis', 'Tulsa', 'Arlington', 'Wichita',
    'Bakersfield', 'Aurora', 'Anaheim', 'Santa Ana', 'St. Louis', 'Riverside',
    'Corpus Christi', 'Lexington', 'Pittsburgh', 'Anchorage', 'Stockton', 'Cincinnati',
    'Orlando', 'Irvine', 'Newark', 'Durham', 'Boulder', 'Boise', 'Nashville'
]

people = [
    'Mira Solis', 'Ethan Vale', 'Leah Mercer', 'Noah Kade', 'Clara Sloane', 'Jonas Hart',
    'Mila Rowan', 'Owen Vance', 'Lena Brooks', 'Caleb Pierce', 'Ari Monroe', 'Sophia Grant',
    'Lucas Bennett', 'Nora Ellis', 'Adrian Cole', 'Emma Ward', 'Eli Turner', 'Zoe Parker',
    'Mason Reed', 'Avery Collins', 'Harper Foster', 'Julian Hayes', 'Lily Ross', 'Xander Shaw',
    'Maya Price', 'Gavin Cook', 'Ruby Ward', 'Isaac Bell', 'Hazel Diaz', 'Jude Morgan',
    'Elena Hunt', 'Ryan Patel', 'Mia Howard', 'Dylan Stone', 'Nina Brooks', 'Carter Hill',
    'Ivy Adams', 'Rowan Gray', 'Abby Flores', 'Kai Meyer', 'Sienna Fox', 'Parker Quinn',
    'Taylor Rivera', 'Connor Green', 'Leonie Shaw', 'Miles Doyle', 'Arielle Cox', 'Julian Pike',
    'Stella Kent', 'Theo Jacobs', 'Riley Burke', 'Camila Ross', 'Logan Price', 'Francesca Dean'
]

stories = [
    'Der Fall begann mit einer vermeintlich harmlosen Beobachtung, entwickelte sich aber schnell zu einem System aus Widersprüchen, Aussagen und Unterlagen, die erst nach Monaten vollständig verstanden wurden. Die Ermittler mussten erkennen, dass der Täter nicht nur die Tat plante, sondern auch die Wahrnehmung der Umgebung. Gerade deshalb blieb der Fall so lange im Fokus der Öffentlichkeit: Er zeigte, wie wenig ein einzelner Moment über die gesamte Wahrheit aussagt.',
    'Im Mittelpunkt der Ermittlungen standen nicht nur die Opfer, sondern auch die Menschen, die sich um sie herum versammelt hatten. Erste Hinweise deuteten auf eine private Auseinandersetzung hin, doch später wurde klar, dass es sich um eine viel größere Kette von Entscheidungen handelte. Die Aufarbeitung machte sichtbar, wie stark Erinnerungen und Gerüchte die Arbeit der Behörden beeinflussen können. Der Fall blieb deshalb ein Symbol für die Schwierigkeit, Schuld und Wahrheit sauber voneinander zu trennen.',
    'Der Täter nutzte eine Mischung aus Nähe, Vertrauen und Vorsicht, um die Tat zu verbergen. Das Opfer hatte über Monate hinweg versucht, Warnzeichen zu erkennen, doch die Umstände waren so komplex, dass niemand die Gefahr vollständig nachvollziehen konnte. Die Ermittler fanden später heraus, dass mehrere Menschen Hinweise gesehen, aber nicht ernst genommen hatten. Der Fall wurde zu einer Mahnung, wie wichtig es ist, Gefahr frühzeitig zu erkennen.',
    'Die Geschichte dieses Falls ist zugleich eine Geschichte über Angst, Kontrolle und die Grenzen der Öffentlichkeit. Was zunächst wie ein einzelner Vorfall wirkte, erwies sich als Teil einer langen Entwicklung, die über Jahre hinweg die beteiligte Gemeinschaft prägte. Die späteren Aussagen der Verdächtigen und die Dokumente aus der Zeit der Ermittlungen führten zu einer Reihe neuer Fragen. Besonders erschütternd war, dass die Wahrnehmung der Tat sich über die Zeit immer wieder änderte.',
    'Der Fall ist deshalb so prägend, weil er nicht nur die Tat selbst, sondern auch die Art und Weise zeigt, wie Menschen in einer Krise reagieren. Während die Polizei nach Spuren suchte, begannen Nachbarn, Familien und Medien, eigene Theorien zu entwickeln. Einige davon waren falsch, andere trafen den Kern des Problems. Die endgültige Aufklärung kam erst, als die Ermittler die verschiedenen Versionen der Geschichte zusammenführten und die entscheidenden Belege fanden.',
    'Die Ermittler standen vor einer ungewöhnlich schwierigen Situation: Es gab viele Indizien, aber kaum einen klaren Zusammenhang. Erst als sie die Zeitachse der Ereignisse genauer untersuchten, wurde deutlich, dass die Opfer und der Täter über längere Zeit in einem Netz aus Abhängigkeiten gelebt hatten. Der Fall führte zu Debatten über Verantwortung, Schutz und die Frage, wie viel ein einzelner Mensch über das Verhalten anderer wissen kann. In der gesellschaftlichen Bewertung war der Fall besonders umstritten.',
    'Was diesen Fall von vielen anderen unterscheidet, ist die Mischung aus persönlicher Tragödie und öffentlicher Aufmerksamkeit. Die Medien formulierten die Geschichte schnell in einfachen Begriffen, doch die tatsächlichen Umstände waren viel komplizierter. Die Aufarbeitung zeigte, dass der Täter sich in einem Umfeld bewegte, in dem Vertrauen und Kontrolle immer wieder ineinandergriffen. Der Prozess machte schließlich sichtbar, wie sehr die Wahrheit in einem Fall von der Art abhängt, wie Menschen über einander erzählen.',
    'Die Geschichte zog sich über Jahre, weil jede neue Phase des Falls neue Fragen aufwarf. Immer wieder tauchten Hinweise auf, die zunächst wie Zufälle wirkten, sich aber später als Teil eines größeren Musters erwiesen. Die Angehörigen mussten lernen, dass Wahrheit nicht aus einem einzigen Satz besteht, sondern aus vielen kleinen, oft schmerzhaften Erkenntnissen. Dieser Fall blieb deshalb so nachhaltig im Gedächtnis, weil er nicht nur eine Tat, sondern eine lange Zeit des Suchens beschreibt.'
]

cases = []
for i in range(380):
    year = 1900 + (i % 125)
    category = categories[i % len(categories)]
    location = locations[i % len(locations)]
    person = people[i % len(people)]
    title = f"{prefixes[i % len(prefixes)]} {person} ({location})"
    summary = f"{person} wurde im Jahr {year} in {location} zu einer Figur, die den öffentlichen Blick auf einen der prägendsten Fälle der Zeit lenkte."
    story = f"{stories[i % len(stories)]} {stories[(i + 3) % len(stories)]}"
    cases.append({
        'id': i + 1,
        'title': title,
        'year': year,
        'category': category,
        'location': location,
        'person': person,
        'summary': summary,
        'story': story,
        'tags': [category, location, str(year)]
    })

output = (
    "const categories = "
    + json.dumps(categories, ensure_ascii=False, indent=2)
    + ";\n\nconst cases = "
    + json.dumps(cases, ensure_ascii=False, indent=2)
    + ";\n"
)

Path('data.js').write_text(output, encoding='utf-8')
print(f'Wrote {len(cases)} cases to data.js')
