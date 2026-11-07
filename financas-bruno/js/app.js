// FINANÇAS BRUNO - lógica do sistema
// Updated Categories Configuration with Gasolina, Cartão, Empréstimo
        const categoriesConfig = {
            income: [
                { name: 'Salário', icon: 'fa-briefcase', color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' },
                { name: 'Investimento', icon: 'fa-chart-line', color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' },
                { name: 'Freelance', icon: 'fa-laptop-code', color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400' },
                { name: 'Presente', icon: 'fa-gift', color: 'bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300' },
                { name: 'Outras Entradas', icon: 'fa-coins', color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' }
            ],
            expense: [
                { name: 'Gasolina', icon: 'fa-gas-pump', color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' },
                { name: 'Cartão', icon: 'fa-credit-card', color: 'bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300' },
                { name: 'Empréstimo', icon: 'fa-hand-holding-dollar', color: 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400' },
                { name: 'Alimentação', icon: 'fa-utensils', color: 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400' },
                { name: 'Moradia', icon: 'fa-house', color: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' },
                { name: 'Transporte', icon: 'fa-car', color: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400' },
                { name: 'Lazer', icon: 'fa-gamepad', color: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' },
                { name: 'Saúde', icon: 'fa-heart-pulse', color: 'bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400' },
                { name: 'Educação', icon: 'fa-graduation-cap', color: 'bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400' },
                { name: 'Outros Gastos', icon: 'fa-receipt', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300' }
            ]
        };

        // Didactic Tips Array
        const didacticTips = [
            "Ao abastecer com gasolina, tente manter uma média semanal. Pequenos trajetos diários somam bastante no fim do mês!",
            "Fatura do Cartão de Crédito: trate-a como uma despesa fixa diária e nunca pague apenas o mínimo!",
            "Se você tem Empréstimos ativos, priorize quitar parcelas ou renegociar para reduzir juros.",
            "Anote pequenos gastos diários. Aquele cafezinho ou lanche rápido no fim do mês pode somar um valor alto!",
            "Antes de fazer uma compra por impulso, espere 24 horas. Se ainda achar necessário, avalie se cabe no seu orçamento."
        ];
        let currentTipIndex = 0;

        // Sample Initial Data
        const sampleTransactions = [
            { id: 1, desc: 'Salário Mensal', amount: 4200.00, type: 'income', category: 'Salário', date: getTodayDate(-6) },
            { id: 2, desc: 'Fatura Cartão Nubank', amount: 680.50, type: 'expense', category: 'Cartão', date: getTodayDate(-4) },
            { id: 3, desc: 'Tanque Cheio - Posto', amount: 220.00, type: 'expense', category: 'Gasolina', date: getTodayDate(-3) },
            { id: 4, desc: 'Parcela Empréstimo', amount: 350.00, type: 'expense', category: 'Empréstimo', date: getTodayDate(-2) },
            { id: 5, desc: 'Projeto Freela Site', amount: 950.00, type: 'income', category: 'Freelance', date: getTodayDate(-1) }
        ];

        // Global State
        let transactions = (function () { try { const t = JSON.parse(store.get('financas_bruno_data')); return Array.isArray(t) ? t : sampleTransactions; } catch (e) { return sampleTransactions; } })();
        let activeFilter = 'all';
        let categoryChartInstance = null;
        let barChartInstance = null;

        // Theme Initialization & Logic
        function initTheme() {
            const savedTheme = store.get('financas_bruno_theme') || 'dark';
            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
                updateThemeIcon(true);
            } else {
                document.documentElement.classList.add('light');
                document.documentElement.classList.remove('dark');
                updateThemeIcon(false);
            }
        }

        function toggleTheme() {
            const isDark = document.documentElement.classList.contains('dark');
            if (isDark) {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
                store.set('financas_bruno_theme', 'light');
                updateThemeIcon(false);
            } else {
                document.documentElement.classList.remove('light');
                document.documentElement.classList.add('dark');
                store.set('financas_bruno_theme', 'dark');
                updateThemeIcon(true);
            }
            // Re-render charts for appropriate dark/light mode font colors
            renderCharts();
        }

        function updateThemeIcon(isDark) {
            const icon = document.getElementById('themeIcon');
            if (isDark) {
                icon.className = 'fa-solid fa-sun text-amber-300 text-base animate-pop';
            } else {
                icon.className = 'fa-solid fa-moon text-pink-500 text-base animate-pop';
            }
        }

        // Initialize App


        function parseMoney(s) {
            s = String(s || '').trim().replace(/[^0-9.,-]/g, '');
            if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
            return parseFloat(s);
        }

        function getTodayDate(offsetDays = 0) {
            const d = new Date();
            d.setDate(d.getDate() + offsetDays);
            return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        }

        function saveState() {
            store.set('financas_bruno_data', JSON.stringify(transactions));
            pushCloud();
            renderApp();
        }

        // ===== Salvamento na nuvem (por usuário, sincroniza entre aparelhos) =====
        let cloudRef = null, cloudTimer = null, dirty = false;

        async function initCloud() {
            try {
                if (!window.claude || !claude.use) return;
                const [user, db] = await Promise.all([claude.use('user'), claude.use('db')]);
                if (!user || !db) return;
                const id = await user.id();
                cloudRef = db.doc('data/users/' + id + '/finance');
                const snap = await cloudRef.get();
                if (snap.exists) {
                    const d = snap.data() || {};
                    if (Array.isArray(d.transactions)) {
                        if (dirty) {
                            const ids = new Set(d.transactions.map(t => t.id));
                            transactions = JSON.parse(JSON.stringify(d.transactions)).concat(transactions.filter(t => !ids.has(t.id)));
                            pushCloud();
                        } else {
                            transactions = JSON.parse(JSON.stringify(d.transactions));
                        }
                    }
                    if (typeof d.limit === 'number' && d.limit > 0 && limitMem === null) { limitMem = d.limit; store.set('financas_bruno_limit', String(d.limit)); }
                    store.set('financas_bruno_data', JSON.stringify(transactions));
                    limitShown = 0;
                    renderApp();
                } else if (store.get('financas_bruno_data') || store.get('financas_bruno_limit')) {
                    pushCloud();
                }
            } catch (e) { /* sem nuvem: continua salvando só neste aparelho */ }
        }

        function pushCloud() {
            if (!cloudRef) return;
            clearTimeout(cloudTimer);
            cloudTimer = setTimeout(() => {
                cloudRef.set({ transactions: transactions, limit: getLimit(), updatedAt: Date.now() }).catch(() => {});
            }, 400);
        }


        // ===== Limite de gastos + porquinho =====
        let limitShown = 0;
        let limitMem = null;
        function getLimit() { if (limitMem !== null) return limitMem; const v = parseFloat(store.get('financas_bruno_limit')); return isNaN(v) ? 0 : v; }

        function saveLimit() {
            const input = document.getElementById('limitInput');
            const v = parseMoney(input.value);
            if (isNaN(v) || v <= 0) { showToast('Digite um limite maior que zero.', 'error'); return; }
            limitMem = v;
            store.set('financas_bruno_limit', String(v));
            pushCloud();
            input.value = '';
            limitShown = 0;
            renderLimit();
            showToast('Limite do mês salvo! 🐷');
        }

        function renderLimit() {
            if (!document.getElementById('limitSection')) return;
            const ym = getTodayDate().slice(0, 7);
            const limit = getLimit();
            const spent = transactions.filter(t => t.type === 'expense' && t.date.startsWith(ym)).reduce((a, t) => a + t.amount, 0);
            const pct = limit > 0 ? (spent / limit) * 100 : 0;
            const left = limit - spent;

            document.getElementById('limitMonth').textContent = monthLabel(ym);
            document.getElementById('limitSpent').textContent = formatCurrency(spent);
            document.getElementById('limitValue').textContent = limit > 0 ? formatCurrency(limit) : 'não definido';
            const leftEl = document.getElementById('limitLeft');
            leftEl.textContent = limit <= 0 ? 'Restam: —' : left >= 0 ? 'Restam: ' + formatCurrency(left) : 'Estourou: ' + formatCurrency(-left);
            leftEl.className = left >= 0 || limit <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400';

            const fill = document.getElementById('limitFill');
            const color = pct >= 100 ? 'bg-rose-500' : pct >= 80 ? 'bg-orange-500' : pct >= 50 ? 'bg-amber-400' : 'bg-emerald-400';
            fill.className = 'limit-fill h-full rounded-full ' + color;
            requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = Math.min(100, pct) + '%'; }));
            document.getElementById('limitBarWrap').classList.toggle('limit-over', pct >= 100);

            // contador animado da porcentagem
            const pctEl = document.getElementById('limitPct');
            const from = limitShown, to = pct, t0 = performance.now();
            limitShown = to;
            (function tick(now) {
                const k = Math.min(1, (now - t0) / 900);
                pctEl.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))) + '%';
                if (k < 1) requestAnimationFrame(tick);
            })(t0);

            // humor do porquinho
            const box = document.getElementById('pigBox');
            const mood = limit <= 0 ? 'ok' : pct >= 100 ? 'over' : pct >= 80 ? 'warn' : 'ok';
            box.className = 'pig-' + mood + ' flex-shrink-0 w-40 sm:w-44 select-none';
            const msgs = {
                none: 'Defina um limite para eu cuidar dos seus gastos do mês! 🐷',
                ok: 'Tudo tranquilo! Você está dentro do limite. 💖',
                warn: 'Alerta! Já passou de 80% do limite, vamos segurar os gastos! 😰',
                over: 'Ai ai ai! Você estourou o limite do mês! 😵'
            };
            document.getElementById('pigMsg').textContent = limit <= 0 ? msgs.none : (mood === 'ok' && pct >= 50 ? 'Atenção: você já usou mais da metade do limite. 🟡' : msgs[mood]);
        }

        function renderApp() {
            [renderTotals, renderTransactionsList, renderLimit, renderCharts, updateHealthStatus].forEach(fn => {
                try { fn(); } catch (err) { console.error(err); }
            });
        }

        // Category dropdown update
        function updateCategoryOptions() {
            const type = document.querySelector('input[name="type"]:checked').value;
            const select = document.getElementById('category');
            select.innerHTML = '';

            categoriesConfig[type].forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.name;
                opt.textContent = cat.name;
                select.appendChild(opt);
            });
        }

        // Calculate and display KPIs
        function renderTotals() {
            const incomes = transactions
                .filter(t => t.type === 'income')
                .reduce((acc, t) => acc + t.amount, 0);

            const expenses = transactions
                .filter(t => t.type === 'expense')
                .reduce((acc, t) => acc + t.amount, 0);

            const balance = incomes - expenses;

            document.getElementById('totalIncomes').textContent = formatCurrency(incomes);
            document.getElementById('totalExpenses').textContent = formatCurrency(expenses);
        }

        function formatCurrency(val) {
            return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }

        // Mês selecionado ('all' ou 'YYYY-MM')
        let activeMonth = 'all';

        function monthLabel(ym) {
            const [y, m] = ym.split('-');
            const s = new Date(+y, +m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            return s.charAt(0).toUpperCase() + s.slice(1);
        }

        function getMonths() {
            return [...new Set(transactions.map(t => t.date.slice(0, 7)))].sort().reverse();
        }

        function setMonth(v) {
            activeMonth = v;
            renderTransactionsList();
        }

        function shiftMonth(dir) {
            const months = getMonths().reverse(); // crescente
            if (months.length === 0) return;
            let i = activeMonth === 'all' ? (dir > 0 ? -1 : months.length) : months.indexOf(activeMonth);
            i = Math.min(months.length - 1, Math.max(0, i + dir));
            activeMonth = months[i];
            renderTransactionsList();
        }

        function renderMonthControls() {
            const months = getMonths();
            if (activeMonth !== 'all' && !months.includes(activeMonth)) activeMonth = 'all';
            const sel = document.getElementById('monthSelect');
            sel.innerHTML = '<option value="all">Todos os meses</option>' +
                months.map(m => `<option value="${m}">${monthLabel(m)}</option>`).join('');
            sel.value = activeMonth;

            const base = transactions.filter(t => activeMonth === 'all' || t.date.startsWith(activeMonth));
            const inc = base.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
            const exp = base.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
            const bal = inc - exp;
            document.getElementById('monthSummary').innerHTML = `
                <div class="rounded-2xl p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                    <div class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Entradas</div>
                    <div class="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">${formatCurrency(inc)}</div>
                </div>
                <div class="rounded-2xl p-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
                    <div class="text-[10px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400">Saídas</div>
                    <div class="text-xs sm:text-sm font-black text-rose-500 dark:text-rose-400">${formatCurrency(exp)}</div>
                </div>
                <div class="rounded-2xl p-2.5 bg-pink-50 dark:bg-gray-800/60 border border-pink-100 dark:border-gray-700">
                    <div class="text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-300">Saldo</div>
                    <div class="text-xs sm:text-sm font-black ${bal >= 0 ? 'text-gray-800 dark:text-white' : 'text-rose-500 dark:text-rose-400'}">${formatCurrency(bal)}</div>
                </div>`;
        }

        // Render Transaction List (agrupada por dia)
        function renderTransactionsList() {
            const container = document.getElementById('transactionsList');
            container.innerHTML = '';
            renderMonthControls();

            const filtered = transactions.filter(t => {
                if (activeMonth !== 'all' && !t.date.startsWith(activeMonth)) return false;
                if (!extraFilter(t)) return false;
                if (activeFilter === 'all') return true;
                return t.type === activeFilter;
            });

            if (filtered.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-14 text-gray-400 flex flex-col items-center justify-center animate-pop">
                        <i class="fa-solid fa-folder-open text-4xl mb-3 text-pink-300 dark:text-pink-500"></i>
                        <p class="text-sm font-medium">Nenhuma transação encontrada.</p>
                    </div>
                `;
                return;
            }

            // Ordena: dia mais recente primeiro
            filtered.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

            // Agrupa por dia
            const days = {};
            filtered.forEach(t => { (days[t.date] = days[t.date] || []).push(t); });

            let idx = 0;
            Object.keys(days).forEach(date => {
                const list = days[date];
                const dInc = list.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
                const dExp = list.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
                let label = new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
                label = label.charAt(0).toUpperCase() + label.slice(1);
                if (date === getTodayDate()) label = 'Hoje • ' + label;
                else if (date === getTodayDate(-1)) label = 'Ontem • ' + label;

                const head = document.createElement('div');
                head.className = 'flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-2 px-1 animate-pop';
                head.innerHTML = `
                    <div class="text-xs font-extrabold text-pink-600 dark:text-pink-300 flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-pink-400"></span>${label}
                    </div>
                    <div class="text-[11px] font-bold flex items-center gap-2">
                        ${dInc > 0 ? `<span class="text-emerald-600 dark:text-emerald-400">+ ${formatCurrency(dInc)}</span>` : ''}
                        ${dExp > 0 ? `<span class="text-rose-500 dark:text-rose-400">- ${formatCurrency(dExp)}</span>` : ''}
                    </div>`;
                container.appendChild(head);

                list.forEach(t => {
                    const isIncome = t.type === 'income';
                    const catObj = [...categoriesConfig.income, ...categoriesConfig.expense].find(c => c.name === t.category) || { icon: 'fa-tag', color: 'bg-gray-100 text-gray-600' };

                    const item = document.createElement('div');
                    item.className = 'flex items-center justify-between p-3.5 bg-pink-50/40 dark:bg-gray-800/40 hover:bg-pink-100/60 dark:hover:bg-gray-700/60 border border-pink-100/60 dark:border-gray-700/60 rounded-2xl transition-all animate-pop group';
                    item.style.animationDelay = `${(idx++) * 0.03}s`;
                    item.innerHTML = `
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl ${catObj.color} flex items-center justify-center text-base font-bold shadow-sm">
                                <i class="fa-solid ${catObj.icon}"></i>
                            </div>
                            <div>
                                <div class="text-sm font-bold text-gray-800 dark:text-white">${escapeHtml(t.desc)}</div>
                                <div class="text-xs text-gray-400 flex items-center gap-2">
                                    <span class="font-medium text-pink-600 dark:text-pink-300">${t.category}</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <span class="text-sm font-black ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}">
                                ${isIncome ? '+' : '-'} ${formatCurrency(t.amount)}
                            </span>
                            <button data-act="editTransaction" data-arg="${t.id}" aria-label="Editar" class="pk-ico"><i class="fa-solid fa-pen"></i></button>
                            <button data-act="deleteTransaction" data-arg="${t.id}" aria-label="Excluir" class="text-gray-300 hover:text-rose-500 dark:text-gray-500 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-1.5 active:scale-90">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    `;
                    container.appendChild(item);
                });
            });
        }

        // Add Transaction Handler
        function handleAddTransaction(e) {
            if (e && e.preventDefault) e.preventDefault();
            const type = document.querySelector('input[name="type"]:checked').value;
            const desc = document.getElementById('desc').value.trim();
            const amount = parseMoney(document.getElementById('amount').value);
            const date = document.getElementById('date').value || getTodayDate(0);
            const category = document.getElementById('category').value;

            if (!desc || isNaN(amount) || amount <= 0 || !date) {
                showToast('Preencha os campos corretamente!', 'error');
                return;
            }

            const newTx = {
                id: Date.now(),
                desc,
                amount,
                type,
                category,
                date
            };

            if (editingId) { const eid = editingId; transactions = transactions.map(t => t.id === eid ? Object.assign({}, newTx, { id: eid }) : t); endEdit(); }
            else transactions = transactions.concat([newTx]);
            dirty = true;
            try { saveState(); } catch (err) { console.error(err); }

            // Clear inputs
            document.getElementById('desc').value = '';
            document.getElementById('amount').value = '';

            showToast('Transação registrada com sucesso!', 'success');
        }

        // Delete Transaction
        function deleteTransaction(id) {
            transactions = transactions.filter(t => t.id !== id);
            saveState();
            showToast('Transação removida.', 'info');
        }

        // Filters UI
        function setFilter(type) {
            activeFilter = type;
            ['all', 'income', 'expense'].forEach(f => {
                const btn = document.getElementById(`filter-${f}`);
                if (f === type) {
                    btn.className = 'px-3 py-1.5 rounded-xl font-bold bg-white dark:bg-darkCard text-pink-600 dark:text-pink-300 shadow-sm transition-all';
                } else {
                    btn.className = 'px-3 py-1.5 rounded-xl font-medium text-gray-500 dark:text-gray-400 hover:text-pink-600 transition-all';
                }
            });
            renderTransactionsList();
        }

        // Financial Health Indicator Logic
        function updateHealthStatus() {
            const incomes = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
            const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
            
            const titleEl = document.getElementById('healthTitle');
            const descEl = document.getElementById('healthDesc');
            const statusEl = document.getElementById('healthStatus');
            const iconEl = document.getElementById('healthIcon');

            if (incomes === 0 && expenses === 0) {
                titleEl.textContent = 'Comece Adicionando Dados!';
                descEl.textContent = 'Cadastre suas primeiras receitas e despesas para acompanhar seu progresso.';
                statusEl.textContent = 'Sem Dados';
                statusEl.className = 'font-bold text-gray-400 text-sm';
                iconEl.className = 'w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center text-xl';
                iconEl.innerHTML = '<i class="fa-solid fa-circle-info"></i>';
                return;
            }

            const ratio = incomes > 0 ? (expenses / incomes) : 1;

            if (expenses > incomes) {
                titleEl.textContent = 'Atenção aos Gastos Bruno! ⚠️';
                descEl.textContent = 'Suas saídas superaram suas receitas neste momento. Cuidado com despesas no cartão e empréstimos.';
                statusEl.textContent = 'Alerta';
                statusEl.className = 'font-extrabold text-rose-500 dark:text-rose-400 text-base';
                iconEl.className = 'w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-950/70 text-rose-500 flex items-center justify-center text-xl';
                iconEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
            } else if (ratio > 0.8) {
                titleEl.textContent = 'Orçamento no Limite!';
                descEl.textContent = 'Você comprometeu mais de 80% das receitas. Tente frear gastos secundários nos próximos dias.';
                statusEl.textContent = 'Moderado';
                statusEl.className = 'font-extrabold text-amber-500 dark:text-amber-400 text-base';
                iconEl.className = 'w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-500 flex items-center justify-center text-xl';
                iconEl.innerHTML = '<i class="fa-solid fa-scale-balanced"></i>';
            } else {
                titleEl.textContent = 'Excelente Gestão Bruno! 🎉';
                descEl.textContent = 'Suas finanças estão equilibradas e sobra margem para poupar ou investir no futuro!';
                statusEl.textContent = 'Excelente';
                statusEl.className = 'font-extrabold text-emerald-600 dark:text-emerald-400 text-base';
                iconEl.className = 'w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-500 flex items-center justify-center text-xl';
                iconEl.innerHTML = '<i class="fa-solid fa-heart"></i>';
            }
        }

        // Render Charts with Chart.js
        function renderCharts() {
            if (typeof Chart === 'undefined') return;
            const isDark = document.documentElement.classList.contains('dark');
            const textColor = isDark ? '#E5E7EB' : '#374151';
            const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255, 182, 193, 0.2)';

            // Category Donut Chart
            const expenseMap = {};
            transactions
                .filter(t => t.type === 'expense')
                .forEach(t => {
                    expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount;
                });

            const categoryLabels = Object.keys(expenseMap);
            const categoryData = Object.values(expenseMap);

            const ctxCategory = document.getElementById('categoryChart').getContext('2d');
            
            if (categoryChartInstance) categoryChartInstance.destroy();

            categoryChartInstance = new Chart(ctxCategory, {
                type: 'doughnut',
                data: {
                    labels: categoryLabels.length > 0 ? categoryLabels : ['Sem Gastos'],
                    datasets: [{
                        data: categoryData.length > 0 ? categoryData : [1],
                        backgroundColor: categoryData.length > 0 ? [
                            '#FFB6C1', '#F4A261', '#E76F51', '#2A9D8F', '#9B5DE5', '#F15BB5', '#00BBF9', '#3A86FF', '#FF006E'
                        ] : ['#E5E7EB'],
                        borderWidth: 2,
                        borderColor: isDark ? '#1A1A22' : '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 800,
                        easing: 'easeOutQuart'
                    },
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: textColor,
                                font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
                                boxWidth: 12,
                                usePointStyle: true
                            }
                        }
                    },
                    cutout: '68%'
                }
            });

            // Bar Chart (Entradas vs Saídas)
            const incomes = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
            const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

            const ctxBar = document.getElementById('barChart').getContext('2d');
            
            if (barChartInstance) barChartInstance.destroy();

            barChartInstance = new Chart(ctxBar, {
                type: 'bar',
                data: {
                    labels: ['Entradas', 'Saídas'],
                    datasets: [{
                        label: 'Total R$',
                        data: [incomes, expenses],
                        backgroundColor: ['#10B981', '#F43F5E'],
                        borderRadius: 12,
                        barThickness: 48
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 800,
                        easing: 'easeOutQuart'
                    },
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: gridColor },
                            ticks: {
                                color: textColor,
                                font: { family: 'Plus Jakarta Sans', size: 11 }
                            }
                        },
                        x: {
                            grid: { display: false },
                            ticks: {
                                color: textColor,
                                font: { family: 'Plus Jakarta Sans', size: 12, weight: 'bold' }
                            }
                        }
                    }
                }
            });
        }

        // Didactic Modal Controls
        function toggleDidacticModal() {
            const modal = document.getElementById('didacticModal');
            modal.classList.toggle('hidden');
            if (!modal.classList.contains('hidden')) {
                showTip(currentTipIndex);
            }
        }

        function showTip(index) {
            document.getElementById('modalTipText').textContent = didacticTips[index];
        }

        function nextTip() {
            currentTipIndex = (currentTipIndex + 1) % didacticTips.length;
            showTip(currentTipIndex);
        }

        // Custom Toast Notification
        function showToast(msg, type = 'success') {
            const toast = document.getElementById('toast');
            const msgEl = document.getElementById('toastMsg');
            const iconEl = document.getElementById('toastIcon');

            msgEl.textContent = msg;

            if (type === 'error') {
                iconEl.className = 'fa-solid fa-circle-exclamation text-rose-400';
            } else if (type === 'info') {
                iconEl.className = 'fa-solid fa-circle-info text-blue-400';
            } else {
                iconEl.className = 'fa-solid fa-circle-check text-emerald-400';
            }

            toast.classList.remove('translate-y-20', 'opacity-0');
            toast.classList.add('translate-y-0', 'opacity-100');

            setTimeout(() => {
                toast.classList.remove('translate-y-0', 'opacity-100');
                toast.classList.add('translate-y-20', 'opacity-0');
            }, 3000);
        }

        // Helper to avoid HTML injection
        function escapeHtml(text) {
            return text.replace(/[&<>"']/g, function(m) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#039;'
                }[m];
            });
        }

        // Inicialização (fim do script: todas as variáveis já existem)

        // ===== Eventos ligados por JavaScript (sem atributos inline) =====
        function bindEvents() {
            const acts = {
                setFilter: a => setFilter(a),
                shiftMonth: a => shiftMonth(parseInt(a, 10)),
                deleteTransaction: a => deleteTransaction(Number(a)),
                nextTip: () => nextTip(),
                saveLimit: () => saveLimit(),
                toggleDidacticModal: () => toggleDidacticModal(),
                toggleTheme: () => toggleTheme(),
                noop: () => {}
            };
            document.addEventListener('click', e => {
                const el = e.target.closest ? e.target.closest('[data-act]') : null;
                if (!el) return;
                const fn = acts[el.getAttribute('data-act')];
                if (fn) fn(el.getAttribute('data-arg'), e);
            });
            const ms = document.getElementById('monthSelect');
            if (ms) ms.addEventListener('change', () => setMonth(ms.value));
            document.querySelectorAll('input[name="type"]').forEach(r => r.addEventListener('change', () => updateCategoryOptions()));
            const li = document.getElementById('limitInput');
            if (li) li.addEventListener('keydown', e => { if (e.key === 'Enter') saveLimit(); });
            const ba = document.getElementById('btnAdd');
            if (ba) {
                let last = 0;
                const fire = ev => { const n = Date.now(); if (n - last < 600) return; last = n; handleAddTransaction(ev); };
                ba.addEventListener('click', fire);
                ba.addEventListener('touchend', ev => { ev.preventDefault(); fire(ev); }, { passive: false });
            }
            const tf = document.getElementById('transactionForm');
            if (tf) tf.addEventListener('keydown', e => {
                if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'radio') handleAddTransaction(e);
            });
        }


        // ===== Animações de lançamento =====
        const COIN_SVG = '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#fbbf24" stroke="#d97706" stroke-width="2.5"/><circle cx="16" cy="16" r="9.5" fill="none" stroke="#f59e0b" stroke-width="1.5"/><text x="16" y="21" text-anchor="middle" font-size="13" font-weight="800" fill="#b45309">$</text></svg>';

        function playFx(type, amount) {
            const btn = document.querySelector('#transactionForm button');
            const r = btn ? btn.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
            const ox = r.left + r.width / 2, oy = r.top + r.height / 2;
            const W = window.innerWidth, H = window.innerHeight;
            const layer = document.createElement('div');
            layer.className = 'fx-layer';
            const isIn = type === 'income';

            const flash = document.createElement('div');
            flash.className = 'fx-flash ' + (isIn ? 'in' : 'out');
            layer.appendChild(flash);

            if (isIn) {
                // chuva de moedinhas
                for (let i = 0; i < 95; i++) {
                    const c = document.createElement('div');
                    c.className = 'fx-coin';
                    c.innerHTML = COIN_SVG;
                    c.style.left = Math.random() * (W - 30) + 'px';
                    c.style.setProperty('--d', (1.3 + Math.random() * 1.2) + 's');
                    c.style.setProperty('--delay', (Math.random() * 0.7) + 's');
                    c.style.setProperty('--dx', ((Math.random() - 0.5) * 80) + 'px');
                    c.style.width = c.style.height = (22 + Math.random() * 16) + 'px';
                    layer.appendChild(c);
                }
            } else {
                // dinheiro voando embora
                for (let i = 0; i < 55; i++) {
                    const b = document.createElement('div');
                    b.className = 'fx-bill';
                    b.textContent = '💸';
                    if (i % 2 === 0) {
                        b.style.left = (ox - 15) + 'px';
                        b.style.top = (oy - 15) + 'px';
                    } else {
                        b.style.left = (Math.random() * (W - 30)) + 'px';
                        b.style.top = (H - 20) + 'px';
                    }
                    b.style.setProperty('--d', (1.2 + Math.random() * 0.9) + 's');
                    b.style.setProperty('--delay', (Math.random() * 0.35) + 's');
                    b.style.setProperty('--dx', ((Math.random() - 0.5) * W * 0.7) + 'px');
                    b.style.setProperty('--dy', (-(H * (0.35 + Math.random() * 0.5))) + 'px');
                    b.style.setProperty('--r', ((Math.random() - 0.5) * 120) + 'deg');
                    layer.appendChild(b);
                }
            }

            const pop = document.createElement('div');
            pop.className = 'fx-pop ' + (isIn ? 'in' : 'out');
            pop.textContent = (isIn ? '+ ' : '- ') + formatCurrency(amount);
            pop.style.left = ox + 'px';
            pop.style.top = oy + 'px';
            layer.appendChild(pop);

            document.body.appendChild(layer);
            setTimeout(() => layer.remove(), 4500);

            const pig = document.getElementById('pigBox');
            if (pig) { pig.classList.remove('pig-jump'); void pig.offsetWidth; pig.classList.add('pig-jump'); setTimeout(() => pig.classList.remove('pig-jump'), 1600); }
        }

        let appStarted = false;
        function startApp() {
            if (appStarted) return;
            appStarted = true;
            try { bindEvents(); } catch (e) { console.error(e); }
            try { initTheme(); } catch (e) { console.error(e); }
            try { document.getElementById('date').value = getTodayDate(0); } catch (e) { console.error(e); }
            try { updateCategoryOptions(); } catch (e) { console.error(e); }
            renderApp();
            initCloud();
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startApp);
        } else {
            startApp();
        }
        window.addEventListener('load', startApp);

// ===== Camada premium (preserva toda a lógica existente) =====
    var hideValues = store.get('fb_hide') === '1', editingId = null, fSearch = '', fCat = 'all', fPeriod = 'all', pcs = {};
    var _fmt = formatCurrency;
    formatCurrency = function (v) { return hideValues ? 'R$ ••••' : _fmt(v); };
    function extraFilter(t) {
        if (fSearch) { const s = fSearch.toLowerCase(); if (!(String(t.desc).toLowerCase().includes(s) || String(t.category).toLowerCase().includes(s))) return false; }
        if (fCat !== 'all' && t.category !== fCat) return false;
        if (fPeriod !== 'all' && t.date < getTodayDate(-parseInt(fPeriod, 10))) return false;
        return true;
    }
    function setMoney(el, v) {
        if (!el) return;
        const from = Number(el.dataset.v) || 0; el.dataset.v = v;
        if (hideValues || matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = formatCurrency(v); return; }
        const t0 = performance.now();
        (function f(n) { const k = Math.min(1, (n - t0) / 700); el.textContent = formatCurrency(from + (v - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0);
    }
    renderTotals = function () {
        const inc = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
        const exp = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
        setMoney(document.getElementById('totalIncomes'), inc);
        setMoney(document.getElementById('totalExpenses'), exp);
    };
    function endEdit() {
        editingId = null;
        const b = document.getElementById('btnAdd');
        if (b && b.dataset.orig) b.innerHTML = b.dataset.orig;
    }
    function editTransaction(id) {
        const t = transactions.find(x => x.id === id); if (!t) return;
        editingId = id;
        const r = document.querySelector('input[name="type"][value="' + t.type + '"]'); if (r) r.checked = true;
        updateCategoryOptions();
        document.getElementById('desc').value = t.desc;
        document.getElementById('amount').value = String(t.amount).replace('.', ',');
        document.getElementById('date').value = t.date;
        document.getElementById('category').value = t.category;
        const b = document.getElementById('btnAdd');
        if (!b.dataset.orig) b.dataset.orig = b.innerHTML;
        b.innerHTML = '<i class="fa-solid fa-check"></i> Salvar alteração';
        document.getElementById('transactionForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast('Editando lançamento. Altere e salve.', 'info');
    }
    function premium() {
        const ym = getTodayDate().slice(0, 7);
        const mt = transactions.filter(t => t.date.startsWith(ym));
        const inc = mt.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
        const exp = mt.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
        const bal = transactions.reduce((a, t) => a + (t.type === 'income' ? t.amount : -t.amount), 0);
        const pct = inc > 0 ? exp / inc * 100 : (exp > 0 ? 100 : 0);
        setMoney(document.getElementById('kEnt'), inc);
        setMoney(document.getElementById('kDes'), exp);
        const eco = document.getElementById('kEco'); setMoney(eco, inc - exp); eco.className = 'pk-val ' + (inc - exp >= 0 ? 'pk-pos' : 'pk-neg');
        document.getElementById('kPct').textContent = (hideValues ? '••' : Math.round(pct)) + '%';
        const bar = document.getElementById('kBar'); bar.style.width = Math.min(100, pct) + '%';
        bar.style.background = pct >= 100 ? 'var(--rd)' : pct >= 80 ? '#ff9f43' : pct >= 50 ? '#ffd166' : 'var(--gn)';
        // categorias do filtro
        const sel = document.getElementById('fCat');
        if (sel) { const cats = [...new Set(transactions.map(t => t.category))].sort(); const cur = fCat;
            sel.innerHTML = '<option value="all">Todas as categorias</option>' + cats.map(c => '<option>' + escapeHtml(c) + '</option>').join(''); sel.value = cats.includes(cur) ? cur : 'all'; fCat = sel.value; }
        premiumCharts(ym, inc, exp);
    }
    function premiumCharts(ym, inc, exp) {
        if (typeof Chart === 'undefined') return;
        const dark = document.documentElement.classList.contains('dark');
        const tc = dark ? '#E5E7EB' : '#374151', gc = dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)';
        const font = { family: 'Plus Jakarta Sans', size: 11, weight: '600' };
        const mk = (id, cfg) => { if (pcs[id]) pcs[id].destroy(); cfg.options = Object.assign({ responsive: true, maintainAspectRatio: false, animation: { duration: 900, easing: 'easeOutQuart' } }, cfg.options); pcs[id] = new Chart(document.getElementById(id).getContext('2d'), cfg); };
        const money = c => ' ' + (hideValues ? 'R$ ••••' : _fmt(c.parsed.y !== undefined ? c.parsed.y : c.parsed));
        const none = inc + exp === 0;
        mk('pcDonut', { type: 'doughnut', data: { labels: none ? ['Sem dados'] : ['Entradas', 'Saídas'], datasets: [{ data: none ? [1] : [inc, exp], backgroundColor: none ? ['#3a3b46'] : ['#10D6A0', '#FF647C'], borderWidth: 2, borderColor: dark ? '#191B23' : '#fff' }] },
            options: { cutout: '68%', plugins: { legend: { position: 'bottom', labels: { color: tc, font, usePointStyle: true, boxWidth: 10 } }, tooltip: { callbacks: { label: c => ' ' + c.label + ':' + money(c) } } } } });
        const days = {}; transactions.forEach(t => { days[t.date] = (days[t.date] || 0) + (t.type === 'income' ? t.amount : -t.amount); });
        let acc = 0; const ks = Object.keys(days).sort(); const pts = ks.map(k => (acc += days[k]));
        mk('pcLine', { type: 'line', data: { labels: ks.map(k => k.slice(8) + '/' + k.slice(5, 7)), datasets: [{ label: 'Saldo', data: pts, borderColor: '#F472A8', backgroundColor: 'rgba(244,114,168,.15)', fill: true, tension: .35, pointRadius: 3, pointBackgroundColor: '#FDA4C5' }] },
            options: { plugins: { legend: { display: false }, tooltip: { callbacks: { label: money } } }, scales: { x: { ticks: { color: tc, font }, grid: { display: false } }, y: { ticks: { color: tc, font, callback: v => hideValues ? '••' : v }, grid: { color: gc } } } } });
        const ms = []; const d = new Date(); d.setDate(1);
        for (let i = 5; i >= 0; i--) { const x = new Date(d.getFullYear(), d.getMonth() - i, 1); ms.push(x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0')); }
        mk('pcBars', { type: 'bar', data: { labels: ms.map(m => monthLabel(m).slice(0, 3)), datasets: [{ label: 'Gastos', data: ms.map(m => transactions.filter(t => t.type === 'expense' && t.date.startsWith(m)).reduce((a, t) => a + t.amount, 0)), backgroundColor: ms.map(m => m === ym ? '#F472A8' : 'rgba(244,114,168,.4)'), borderRadius: 8 }] },
            options: { plugins: { legend: { display: false }, tooltip: { callbacks: { label: money } } }, scales: { x: { ticks: { color: tc, font }, grid: { display: false } }, y: { beginAtZero: true, ticks: { color: tc, font, callback: v => hideValues ? '••' : v }, grid: { color: gc } } } } });
    }
    var _ra = renderApp;
    renderApp = function () { _ra(); try { premium(); } catch (e) { console.error(e); } };

    // pesquisa e filtros
    (function () {
        const host = document.getElementById('monthSummary');
        if (host) host.parentElement.insertAdjacentHTML('afterend', '<div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4"><div style="position:relative"><i class="fa-solid fa-magnifying-glass" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#F472A8;font-size:13px"></i><input id="fSearch" class="pk-in" style="padding-left:34px" placeholder="Buscar lançamento..." autocomplete="off"></div><select id="fCat" class="pk-in"></select><select id="fPer" class="pk-in"><option value="all">Todo o período</option><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option></select></div>');
        const re = () => { try { renderTransactionsList(); } catch (e) { console.error(e); } };
        document.getElementById('fSearch').addEventListener('input', e => { fSearch = e.target.value.trim(); re(); });
        document.getElementById('fCat').addEventListener('change', e => { fCat = e.target.value; re(); });
        document.getElementById('fPer').addEventListener('change', e => { fPeriod = e.target.value; re(); });
        // ações novas (editar)
        document.addEventListener('click', e => { const el = e.target.closest && e.target.closest('[data-act="editTransaction"]'); if (el) editTransaction(Number(el.getAttribute('data-arg'))); });
        // menu de configurações
        const tb = document.getElementById('themeBtn');
        if (tb) {
            const wrap = document.createElement('div'); wrap.style.position = 'relative';
            wrap.innerHTML = '<button id="cfgBtn" aria-label="Configurações" class="' + tb.className + '"><i class="fa-solid fa-gear text-base"></i></button><div id="cfgMenu" class="pk-menu"><button id="cfgHide"></button><button id="cfgTheme"><i class="fa-solid fa-moon"></i> Alternar tema claro/escuro</button><button id="cfgLimit"><i class="fa-solid fa-bullseye"></i> Definir limite do mês</button></div>';
            tb.parentElement.insertBefore(wrap, tb);
            const menu = wrap.querySelector('#cfgMenu'), hb = wrap.querySelector('#cfgHide');
            const paint = () => { hb.innerHTML = '<i class="fa-solid ' + (hideValues ? 'fa-eye' : 'fa-eye-slash') + '"></i> ' + (hideValues ? 'Mostrar valores' : 'Ocultar valores'); };
            paint();
            wrap.querySelector('#cfgBtn').addEventListener('click', ev => { ev.stopPropagation(); menu.classList.toggle('open'); });
            document.addEventListener('click', () => menu.classList.remove('open'));
            hb.addEventListener('click', () => { hideValues = !hideValues; store.set('fb_hide', hideValues ? '1' : '0'); paint(); limitShown = 0; renderApp(); showToast(hideValues ? 'Valores ocultos.' : 'Valores visíveis.', 'info'); });
            wrap.querySelector('#cfgTheme').addEventListener('click', () => { toggleTheme(); renderApp(); });
            wrap.querySelector('#cfgLimit').addEventListener('click', () => { const l = document.getElementById('limitInput'); l.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => l.focus(), 500); });
            tb.addEventListener('click', () => setTimeout(renderApp, 50));
        }
        // navegação estilo app (celular)
        const nav = document.createElement('nav'); nav.id = 'pkNav';
        const items = [['fa-house', 'Início', () => document.getElementById('dash')], ['fa-plus', 'Lançar', () => document.getElementById('transactionForm')], ['fa-list', 'Histórico', () => document.getElementById('transactionsList')], ['fa-piggy-bank', 'Limite', () => document.getElementById('limitSection')], ['fa-chart-pie', 'Gráficos', () => document.getElementById('chartsP')]];
        items.forEach(([ic, lb, get]) => { const b = document.createElement('button'); b.innerHTML = '<i class="fa-solid ' + ic + '"></i>' + lb; b.addEventListener('click', () => { const t = get(); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }); nav.appendChild(b); });
        document.body.appendChild(nav);
    })();
    if (typeof appStarted !== 'undefined' && appStarted) renderApp();

(function () {
        const main = document.querySelector('main'); if (!main) return;
        const $ = id => document.getElementById(id), card = id => $(id) && $(id).closest('.card-shadow');
        const dash = $('dash'), health = $('healthTitle') && $('healthTitle').closest('section'), form = card('transactionForm'), hist = card('transactionsList'), limit = $('limitSection');
        if (!dash || !form || !hist || !limit) return;
        const one = document.createElement('div'); one.id = 'one'; one.dataset.v = 'home';
        dash.classList.add('a-kpi'); if (health) { health.id = 'healthCard'; dash.appendChild(health); }
        form.classList.add('a-form'); hist.classList.add('a-hist'); limit.classList.add('a-limit');
        const tabs = [['categoryChart', 'Categorias'], ['pcDonut', 'Entradas x Saídas'], ['pcLine', 'Saldo'], ['pcBars', 'Meses'], ['barChart', 'Comparativo']];
        const panel = document.createElement('section'); panel.id = 'chartPanel';
        panel.className = 'a-charts bg-white dark:bg-darkCard rounded-3xl card-shadow border border-pink-50 dark:border-darkBorder';
        panel.innerHTML = '<div class="ct">' + tabs.map((t, i) => '<button data-c="' + t[0] + '" class="' + (i ? '' : 'on') + '">' + t[1] + '</button>').join('') + '</div>' + tabs.map((t, i) => '<div class="chv' + (i ? '' : ' on') + '" id="v_' + t[0] + '"></div>').join('');
        tabs.forEach(t => { const c = $(t[0]), v = panel.querySelector('#v_' + t[0]); if (c && v) v.appendChild(c); });
        one.append(dash, form, hist, limit, panel);
        main.appendChild(one); document.body.classList.add('pk-fit');
        const redraw = () => { try { renderCharts(); premium(); } catch (e) { console.error(e); } };
        panel.querySelector('.ct').addEventListener('click', e => {
            const b = e.target.closest('button'); if (!b) return;
            panel.querySelectorAll('.ct button').forEach(x => x.classList.toggle('on', x === b));
            panel.querySelectorAll('.chv').forEach(v => v.classList.toggle('on', v.id === 'v_' + b.dataset.c));
            redraw();
        });
        // navegação por abas (celular/tablet)
        const nav = $('pkNav'), btns = [];
        function setView(v) { one.dataset.v = v; btns.forEach(([b, k]) => b.classList.toggle('on', k === v)); if (v === 'charts') setTimeout(redraw, 60); }
        if (nav) {
            nav.innerHTML = '';
            [['fa-house', 'Início', 'home'], ['fa-plus', 'Lançar', 'add'], ['fa-list', 'Histórico', 'hist'], ['fa-chart-pie', 'Gráficos', 'charts']].forEach(([ic, lb, v]) => {
                const b = document.createElement('button'); b.innerHTML = '<i class="fa-solid ' + ic + '"></i>' + lb;
                b.addEventListener('click', () => setView(v)); nav.appendChild(b); btns.push([b, v]);
            });
            setView('home');
        }
        const _et = editTransaction; editTransaction = function (id) { _et(id); if (innerWidth < 1100) setView('add'); };
        const cl = $('cfgLimit'); if (cl) cl.addEventListener('click', () => { if (innerWidth < 1100) setView('home'); });
        setTimeout(redraw, 100);
    })();

(function () {
        const $ = id => document.getElementById(id);
        const PAL = ['#F472A8', '#FFAB59', '#10D6A0', '#7C9CFF', '#B794F6', '#FF647C', '#4FD1E8', '#FDA4C5'];
        const cards = document.querySelectorAll('#dash .pk-card');
        const tips = ['Total recebido neste mês', 'Total gasto neste mês', 'Entradas menos despesas do mês', 'Quanto da renda do mês já foi gasto'];
        cards.forEach((c, i) => { if (tips[i]) c.title = tips[i]; if (i < 3) c.insertAdjacentHTML('beforeend', '<svg class="pk-sp" viewBox="0 0 70 26" preserveAspectRatio="none"></svg><div class="pk-d"></div>'); });
        const hc = $('healthCard');
        if (hc) hc.insertAdjacentHTML('afterbegin', '<div class="hring" title="Pontuação de saúde financeira"><svg viewBox="0 0 50 50"><circle class="bg" cx="25" cy="25" r="21"/><circle class="fg" cx="25" cy="25" r="21" stroke-dasharray="131.9" stroke-dashoffset="131.9" stroke="#10D6A0"/></svg><b id="hScore">--</b></div>');
        const sum = (arr, f) => arr.filter(f).reduce((a, t) => a + t.amount, 0);
        function spark(svg, vals, color) {
            if (!svg) return;
            if (vals.filter(v => v !== 0).length < 2) { svg.innerHTML = ''; return; }
            const mn = Math.min(...vals), mx = Math.max(...vals), r = mx - mn || 1;
            const pts = vals.map((v, i) => (i / (vals.length - 1) * 70).toFixed(1) + ',' + (24 - (v - mn) / r * 22).toFixed(1));
            svg.innerHTML = '<polyline fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="' + pts.join(' ') + '"/>';
        }
        function delta(el, cur, prev, goodUp) {
            if (!el) return; if (!prev) { el.textContent = ''; return; }
            const d = (cur - prev) / Math.abs(prev) * 100, up = d >= 0, good = up === goodUp;
            el.style.color = good ? '#10D6A0' : '#FF647C';
            el.textContent = hideValues ? '' : (up ? '▲ ' : '▼ ') + Math.abs(Math.round(d)) + '% vs mês anterior';
        }
        function extras() {
            const ym = getTodayDate().slice(0, 7), d0 = new Date(), pm = new Date(d0.getFullYear(), d0.getMonth() - 1, 1);
            const pym = pm.getFullYear() + '-' + String(pm.getMonth() + 1).padStart(2, '0');
            const cur = transactions.filter(t => t.date.startsWith(ym)), prev = transactions.filter(t => t.date.startsWith(pym));
            const days = [...Array(14)].map((_, i) => getTodayDate(i - 13));
            const ser = f => days.map(d => transactions.filter(t => t.date === d).reduce((a, t) => a + f(t), 0));
            const sp = document.querySelectorAll('#dash .pk-sp'), dl = document.querySelectorAll('#dash .pk-d');
            spark(sp[0], ser(t => t.type === 'income' ? t.amount : 0), '#10D6A0');
            spark(sp[1], ser(t => t.type === 'expense' ? t.amount : 0), '#FF647C');
            spark(sp[2], ser(t => t.type === 'income' ? t.amount : -t.amount), '#F472A8');
            const ci = sum(cur, t => t.type === 'income'), ce = sum(cur, t => t.type === 'expense'), pi = sum(prev, t => t.type === 'income'), pe = sum(prev, t => t.type === 'expense');
            delta(dl[0], ci, pi, true); delta(dl[1], ce, pe, false); delta(dl[2], ci - ce, pi - pe, true);
            const ai = sum(transactions, t => t.type === 'income'), ae = sum(transactions, t => t.type === 'expense'), pct = (ai === 0 && ae === 0) ? null : (ai > 0 ? ae / ai * 100 : 100), fg = document.querySelector('.hring .fg'), sc = $('hScore');
            if (fg && sc) {
                const score = pct === null ? null : Math.max(0, Math.round(100 - Math.min(100, pct)));
                sc.textContent = score === null ? '--' : score;
                fg.style.strokeDashoffset = 131.9 * (1 - (score || 0) / 100);
                fg.style.stroke = score === null ? '#303440' : score >= 50 ? '#10D6A0' : score >= 20 ? '#FFAB59' : '#FF647C';
            }
            document.querySelectorAll('[aria-label]:not([title])').forEach(e => { e.title = e.getAttribute('aria-label'); });
        }
        const _rc = renderCharts;
        renderCharts = function () {
            _rc();
            try {
                const c = categoryChartInstance;
                if (c) { c.data.datasets[0].backgroundColor = c.data.labels[0] === 'Sem Gastos' ? ['#303440'] : PAL; c.options.cutout = '74%'; c.options.plugins.legend.position = 'right'; c.update(); }
                const b = barChartInstance;
                if (b) { b.data.datasets[0].backgroundColor = ['#10D6A0', '#FF647C']; b.data.datasets[0].borderRadius = 10; b.update(); }
            } catch (e) { console.error(e); }
        };
        const _ra = renderApp;
        renderApp = function () { _ra(); try { extras(); } catch (e) { console.error(e); } };
        renderApp();
    })();
