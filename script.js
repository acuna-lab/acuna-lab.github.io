document.addEventListener('DOMContentLoaded', () => {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            // Hero
            document.getElementById('header-name').textContent = data.header.name;
            document.getElementById('header-tagline').textContent = data.header.tagline;
            document.getElementById('recruiting-pill').style.display = data.recruiting ? 'inline-block' : 'none';
            document.getElementById('overview-content').innerHTML = data.header.description;

            // Research (projects + tools merged)
            document.getElementById('research-title').textContent = data.research.title;
            const researchList = document.getElementById('research-list');
            data.research.projects.forEach(project => {
                const div = document.createElement('div');
                div.classList.add('research-item');
                let toolsHtml = '';
                if (project.tools && project.tools.length) {
                    toolsHtml = `<div class="project-tools">${project.tools.map(t => `<span class="tag">${t}</span>`).join('')}</div>`;
                }
                div.innerHTML = `<h3>${project.title}</h3><p>${project.description}</p>${toolsHtml}`;
                researchList.appendChild(div);
            });

            // People
            document.getElementById('people-title').textContent = data.members.title;
            const peopleList = document.getElementById('people-list');

            // Lab head
            const headDiv = document.createElement('div');
            headDiv.classList.add('member-item', 'expandable');
            const head = data.members.lab_head;
            const headEmailHref = head.email ? head.email.replace(/\[dot\]/g, '.').replace('[at]', '@') : '';
            let headDetails = '';
            if (head.bio) headDetails += `<p class="member-bio">${head.bio}</p>`;
            if (head.specializations && head.specializations.length) headDetails += `<div class="member-tags"><span class="member-tags-label">Specializations:</span>${head.specializations.map(s => `<span class="tag">${s}</span>`).join('')}</div>`;
            if (head.hobbies && head.hobbies.length) headDetails += `<div class="member-tags"><span class="member-tags-label">Hobbies:</span>${head.hobbies.map(h => `<span class="tag">${h}</span>`).join('')}</div>`;
            if (head.fun_fact) headDetails += `<p class="member-funfact">💡 ${head.fun_fact}</p>`;
            if (head.email) headDetails += `<p class="member-email"><a href="mailto:${headEmailHref}">${head.email}</a></p>`;
            const headInitials = head.name.replace(/^(MSc|Dr|Prof)\s*/,'').split(' ').filter(w=>w.length>1).map(w=>w[0]).join('').slice(0,2);
            const headPhotoLarge = `<div class="member-photo-large"><img src="${head.photo}" alt="${head.name}" onerror="this.outerHTML=&quot;<div class='member-photo-placeholder'>${headInitials}</div>&quot;"></div>`;
            const headPhotoSmall = `<img src="${head.photo}" alt="" class="member-photo-sm" onerror="this.outerHTML=&quot;<div class='member-photo-sm member-photo-placeholder-sm'>${headInitials}</div>&quot;">`;
            headDiv.innerHTML = `
                <div class="member-header">
                    <div class="member-info">${headPhotoSmall}<div><h3>${head.flag || ''} ${head.name}</h3><p class="member-role">${head.role}</p></div></div>
                    <span class="expand-icon">&#9662;</span>
                </div>
                <div class="member-details"><div class="member-expanded-layout">${headPhotoLarge}<div class="member-expanded-content">${headDetails}</div></div></div>`;
            headDiv.querySelector('.member-header').addEventListener('click', () => {
                headDiv.classList.toggle('expanded');
            });
            peopleList.appendChild(headDiv);

            // PhD students
            data.members.phd_students.forEach(student => {
                const studentDiv = document.createElement('div');
                studentDiv.classList.add('member-item', 'expandable');
                const emailHref = student.email ? student.email.replace('[at]', '@').replace(/\[dot\]/g, '.') : '';
                let details = '';
                if (student.bio) details += `<p class="member-bio">${student.bio}</p>`;
                if (student.specializations && student.specializations.length) details += `<div class="member-tags"><span class="member-tags-label">Specializations:</span>${student.specializations.map(s => `<span class="tag">${s}</span>`).join('')}</div>`;
                if (student.hobbies && student.hobbies.length) details += `<div class="member-tags"><span class="member-tags-label">Hobbies:</span>${student.hobbies.map(h => `<span class="tag">${h}</span>`).join('')}</div>`;
                if (student.fun_fact) details += `<p class="member-funfact">💡 ${student.fun_fact}</p>`;
                if (student.email) details += `<p class="member-email"><a href="mailto:${emailHref}">${student.email}</a></p>`;
                const studentInitials = student.name.replace(/^(MSc|Dr|Prof)\s*/,'').split(' ').filter(w=>w.length>1).map(w=>w[0]).join('').slice(0,2);
                const studentPhotoLarge = `<div class="member-photo-large"><img src="${student.photo}" alt="${student.name}" onerror="this.outerHTML=&quot;<div class='member-photo-placeholder'>${studentInitials}</div>&quot;"></div>`;
                const studentPhotoSmall = `<img src="${student.photo}" alt="" class="member-photo-sm" onerror="this.outerHTML=&quot;<div class='member-photo-sm member-photo-placeholder-sm'>${studentInitials}</div>&quot;">`;
                studentDiv.innerHTML = `
                    <div class="member-header">
                        <div class="member-info">${studentPhotoSmall}<div><h3>${student.flag} ${student.name}</h3><p class="member-role">PhD Student &middot; ${student.project}</p></div></div>
                        <span class="expand-icon">&#9662;</span>
                    </div>
                    <div class="member-details"><div class="member-expanded-layout">${studentPhotoLarge}<div class="member-expanded-content">${details}</div></div></div>`;
                studentDiv.querySelector('.member-header').addEventListener('click', () => {
                    studentDiv.classList.toggle('expanded');
                });
                peopleList.appendChild(studentDiv);
            });

            // Publications (sorted newest first, grouped by year)
            document.getElementById('publications-title').textContent = data.publications.title;
            const pubList = document.getElementById('publications-list');
            const extractYear = (title) => { const m = title.match(/\((\d{4})\)/); return m ? parseInt(m[1]) : 0; };
            const sorted = [...data.publications.items].sort((a, b) => extractYear(b.title) - extractYear(a.title));
            const grouped = {};
            sorted.forEach(pub => {
                const year = extractYear(pub.title);
                if (!grouped[year]) grouped[year] = [];
                grouped[year].push(pub);
            });
            Object.keys(grouped).sort((a, b) => b - a).forEach(year => {
                const yearHeader = document.createElement('li');
                yearHeader.classList.add('pub-year-header');
                yearHeader.textContent = year;
                pubList.appendChild(yearHeader);
                grouped[year].forEach(pub => {
                    const li = document.createElement('li');
                    li.classList.add('publication-item');
                    const boldTitle = pub.title.replace(/Acuña MA/g, '<strong>Acuña MA</strong>');
                    let links = '';
                    if (pub.pubmed_link) links += `<a href="${pub.pubmed_link}" target="_blank" class="pub-link">PubMed</a>`;
                    if (pub.doi_link) links += `<a href="${pub.doi_link}" target="_blank" class="pub-link">DOI</a>`;
                    li.innerHTML = `<p>${boldTitle}</p>${links ? `<div class="pub-links">${links}</div>` : ''}`;
                    pubList.appendChild(li);
                });
            });

            // Join Us
            document.getElementById('join-title').textContent = data.join.title;
            let joinHtml = data.join.content;
            joinHtml = joinHtml.replace(/<span class='contact-obfuscated'>(.*?)<\/span>/g, (match, email) => {
                const decoded = email.replace(/\[dot\]/g, '.').replace('[at]', '@');
                return `<a href="mailto:${decoded}">${email}</a>`;
            });
            document.getElementById('join-content').innerHTML = `<p>${joinHtml}</p>`;

            // Footer
            const footerEmail = data.footer.email.replace('[at]', '@').replace(/\[dot\]/g, '.');
            document.getElementById('footer-address').innerHTML = data.footer.address.replace(/\n/g, '<br>');
            document.getElementById('footer-email').innerHTML = `<a href="mailto:${footerEmail}">${data.footer.email}</a>`;

            const footerLinksList = document.getElementById('footer-links-list');
            data.footer.links.forEach(link => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="${link.url}" target="_blank">${link.name}</a>`;
                footerLinksList.appendChild(li);
            });

            document.getElementById('footer-funding-content').innerHTML = `<p><a href="${data.footer.funding.url}" target="_blank">${data.footer.funding.text}</a></p>`;

            document.getElementById('footer-name').textContent = data.header.name;
            document.getElementById('footer-year').textContent = new Date().getFullYear();
        })
        .catch(error => console.error('Error fetching data:', error));
});
