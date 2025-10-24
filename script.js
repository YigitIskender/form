// Form Data Storage
const formData = {
    q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '',
    q8: [], q9: '', q10: '', q11: '', q12: '', q13: '', q14: '',
    q15: '', q16: '', q17: [],
    fullName: '', email: '', phone: ''
};

let currentScreen = 0;
const totalScreens = 18; // 0 (welcome) + 17 questions + 1 contact

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateProgress();
    updateBackButton();
    
    // Q8 Other checkbox listener
    const q8OtherCheckbox = document.getElementById('q8Other');
    const q8OtherText = document.getElementById('q8OtherText');
    
    if (q8OtherCheckbox) {
        q8OtherCheckbox.addEventListener('change', function() {
            if (this.checked) {
                q8OtherText.style.display = 'block';
            } else {
                q8OtherText.style.display = 'none';
                q8OtherText.value = '';
            }
        });
    }
    
    // Q17 Other checkbox listener
    const q17OtherCheckbox = document.getElementById('q17Other');
    const q17OtherText = document.getElementById('q17OtherText');
    
    if (q17OtherCheckbox) {
        q17OtherCheckbox.addEventListener('change', function() {
            if (this.checked) {
                q17OtherText.style.display = 'block';
            } else {
                q17OtherText.style.display = 'none';
                q17OtherText.value = '';
            }
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            const activeScreen = document.querySelector('.screen.active');
            const textarea = activeScreen?.querySelector('textarea');
            
            // Don't submit on Enter in textarea
            if (textarea && document.activeElement === textarea) {
                return;
            }
            
            // Check if we can proceed
            if (canProceed()) {
                e.preventDefault();
                nextScreen();
            }
        }
    });
});

// Screen Navigation
function nextScreen() {
    // Validate current screen before proceeding
    if (!validateCurrentScreen()) {
        return;
    }
    
    const screens = document.querySelectorAll('.screen');
    screens[currentScreen].classList.remove('active');
    
    currentScreen++;
    
    // Skip conditional screens if needed
    if (currentScreen === 10 && formData.q9 !== 'Diğer') {
        currentScreen++; // Skip Q10 if Q9 is not "Diğer"
    }
    
    if (currentScreen === 12 && formData.q11 !== 'Evet') {
        currentScreen++; // Skip Q12
    }
    
    if (currentScreen === 16 && formData.q13 !== 'Evet') {
        currentScreen++; // Skip Q16
    }
    
    screens[currentScreen].classList.add('active');
    updateProgress();
    updateBackButton();
    window.scrollTo(0, 0);
}

function prevScreen() {
    const screens = document.querySelectorAll('.screen');
    screens[currentScreen].classList.remove('active');
    
    currentScreen--;
    
    // Skip conditional screens when going back
    if (currentScreen === 16 && formData.q13 !== 'Evet') {
        currentScreen--; // Skip Q16
    }
    
    if (currentScreen === 12 && formData.q11 !== 'Evet') {
        currentScreen--; // Skip Q12
    }
    
    if (currentScreen === 10 && formData.q9 !== 'Diğer') {
        currentScreen--; // Skip Q10 if Q9 is not "Diğer"
    }
    
    screens[currentScreen].classList.add('active');
    updateProgress();
    updateBackButton();
    window.scrollTo(0, 0);
}

function updateBackButton() {
    const btnBack = document.getElementById('btnBack');
    const activeScreen = document.querySelector('.screen.active');
    const screenNum = activeScreen ? parseInt(activeScreen.getAttribute('data-screen')) : 0;
    
    // Show back button for all screens except welcome (0) and success
    if (currentScreen > 0 && screenNum !== 'success' && !isNaN(screenNum)) {
        btnBack.style.display = 'block';
    } else {
        btnBack.style.display = 'none';
    }
}

function updateProgress() {
    const progress = (currentScreen / totalScreens) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progressText').textContent = Math.round(progress) + '%';
}

// Option Selection
function selectOption(button, question) {
    // Remove previous selection
    const parent = button.parentElement;
    parent.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Select current option
    button.classList.add('selected');
    formData[question] = button.getAttribute('data-value');
    
    // Auto-advance after selection (with slight delay for better UX)
    setTimeout(() => {
        nextScreen();
    }, 300);
}

// Validation
function validateCurrentScreen() {
    const activeScreen = document.querySelector('.screen.active');
    const screenNum = parseInt(activeScreen.getAttribute('data-screen'));
    
    // Screen 0 (Welcome) - no validation needed
    if (screenNum === 0) return true;
    
    // Screen 3 (Q3 - textarea)
    if (screenNum === 3) {
        const value = document.getElementById('q3').value.trim();
        if (!value) {
            showError('Lütfen bu alanı doldurun.');
            return false;
        }
        formData.q3 = value;
        return true;
    }
    
    // Screen 8 (Q8 - checkboxes)
    if (screenNum === 8) {
        const checked = activeScreen.querySelectorAll('input[name="q8"]:checked');
        if (checked.length === 0) {
            showError('Lütfen en az bir seçenek işaretleyin.');
            return false;
        }
        
        const services = Array.from(checked).map(cb => cb.value);
        const otherText = document.getElementById('q8OtherText').value.trim();
        
        // If "Diğer" is selected, add the custom text
        if (services.includes('Diğer') && otherText) {
            formData.q8 = services.filter(s => s !== 'Diğer').concat([`Diğer: ${otherText}`]);
        } else if (services.includes('Diğer') && !otherText) {
            showError('Lütfen diğer hizmet adını yazınız.');
            return false;
        } else {
            formData.q8 = services;
        }
        
        return true;
    }
    
    // Screen 10 (Q10 - text input)
    if (screenNum === 10) {
        const value = document.getElementById('q10').value.trim();
        if (!value) {
            showError('Lütfen bu alanı doldurun.');
            return false;
        }
        formData.q10 = value;
        return true;
    }
    
    // Screen 12 (Q12 - number input - conditional)
    if (screenNum === 12) {
        const value = document.getElementById('q12').value;
        if (!value || value < 1) {
            showError('Lütfen geçerli bir sayı girin.');
            return false;
        }
        formData.q12 = value;
        return true;
    }
    
    // Screen 16 (Q16 - number input - conditional)
    if (screenNum === 16) {
        const value = document.getElementById('q16').value;
        if (!value || value < 1) {
            showError('Lütfen geçerli bir sayı girin.');
            return false;
        }
        formData.q16 = value;
        return true;
    }
    
    // Screen 17 (Q17 - checkboxes)
    if (screenNum === 17) {
        const checked = activeScreen.querySelectorAll('input[name="q17"]:checked');
        if (checked.length === 0) {
            showError('Lütfen en az bir banka seçin.');
            return false;
        }
        
        const banks = Array.from(checked).map(cb => cb.value);
        const otherText = document.getElementById('q17OtherText').value.trim();
        
        // If "Diğer" is selected, add the custom text
        if (banks.includes('Diğer') && otherText) {
            formData.q17 = banks.filter(b => b !== 'Diğer').concat([`Diğer: ${otherText}`]);
        } else if (banks.includes('Diğer') && !otherText) {
            showError('Lütfen diğer banka adını yazınız.');
            return false;
        } else {
            formData.q17 = banks;
        }
        
        return true;
    }
    
    // Screen 18 (Contact info)
    if (screenNum === 18) {
        const name = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        
        if (!name) {
            showError('Lütfen adınızı ve soyadınızı girin.');
            return false;
        }
        
        if (!email || !isValidEmail(email)) {
            showError('Lütfen geçerli bir e-posta adresi girin.');
            return false;
        }
        
        formData.fullName = name;
        formData.email = email;
        formData.phone = document.getElementById('phone').value.trim();
        return true;
    }
    
    return true;
}

function canProceed() {
    const activeScreen = document.querySelector('.screen.active');
    const screenNum = parseInt(activeScreen.getAttribute('data-screen'));
    
    // Check if an option is selected for option-based questions
    if ([1, 2, 4, 5, 6, 7, 9, 11, 13, 14, 15].includes(screenNum)) {
        const selected = activeScreen.querySelector('.option-btn.selected');
        return selected !== null;
    }
    
    return true;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(message) {
    alert(message);
}

// Form Submission
async function submitForm() {
    if (!validateCurrentScreen()) {
        return;
    }
    
    // Check honeypot
    if (document.getElementById('honeypot').value !== '') {
        console.log('Bot detected');
        return;
    }
    
    // Prepare email content
    const emailContent = generateEmailContent();
    
    console.log('Form Data:', formData);
    console.log('Email Content:', emailContent);
    
    try {
        // Here you would integrate with your email service
        // For now, we'll simulate sending
        
        // Option 1: Use FormSubmit.co (no backend needed)
        // Uncomment and replace with your email
        /*
        const response = await fetch('https://formsubmit.co/your-email@example.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: formData.fullName,
                email: formData.email,
                message: emailContent
            })
        });
        */
        
        // Option 2: Use EmailJS
        // Requires EmailJS account setup
        
        // Simulate successful submission
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show success screen
        const screens = document.querySelectorAll('.screen');
        screens[currentScreen].classList.remove('active');
        document.querySelector('[data-screen="success"]').classList.add('active');
        updateProgress();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Form gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
}

function generateEmailContent() {
    let content = `
=== BAE ŞİRKET KURULUŞ FORMU ===

İLETİŞİM BİLGİLERİ:
Ad Soyad: ${formData.fullName}
E-posta: ${formData.email}
Telefon: ${formData.phone || 'Belirtilmedi'}

FORM CEVAPLARI:

1. Mevcut bir şirketiniz var mı?
   → ${formData.q1}

2. Değer yaratma alanınız nedir?
   → ${formData.q2}

3. İş aktivitenizi detaylı olarak açıklayınız:
   → ${formData.q3}

4. Yıllık cironuz ne kadardır? ($)
   → ${formData.q4}

5. Yıllık ithalatınız ne kadardır? ($)
   → ${formData.q5}

6. Yıllık ihracatınız ne kadardır? ($)
   → ${formData.q6}

7. Yıllık kârlılığınız ne kadardır? ($)
   → ${formData.q7}

8. İlgilendiğiniz hizmetler:
   → ${formData.q8.join(', ')}

9. Ortaklık türü nedir?
   → ${formData.q9}
`;

    if (formData.q9 === 'Diğer' && formData.q10) {
        content += `
10. Ortaklık yapısını detaylandırınız:
    → ${formData.q10}
`;
    }

    content += `
11. Oturma izni talebi var mı?
    → ${formData.q11}
`;

    if (formData.q11 === 'Evet' && formData.q12) {
        content += `
12. Kaç kişi için oturma izni talep ediyorsunuz?
    → ${formData.q12} kişi
`;
    }

    content += `
13. Fiziksel ofis talebi var mı?
    → ${formData.q13}

14. Daha önce BAE'de şirketiniz oldu mu?
    → ${formData.q14}

15. Daha önce BAE'de oturma izniniz oldu mu?
    → ${formData.q15}
`;

    if (formData.q13 === 'Evet' && formData.q16) {
        content += `
16. Ofiste kaç kişi çalışacak?
    → ${formData.q16} kişi
`;
    }

    content += `
17. Hangi Türk bankalarında hesabınız var?
    → ${formData.q17.join(', ')}

=== FORM SONU ===
Gönderim Tarihi: ${new Date().toLocaleString('tr-TR')}
`;

    return content;
}
