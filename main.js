document.addEventListener('DOMContentLoaded', () => {
  
  // 1. SCROLL REVEAL OBSERVER
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  reveals.forEach(reveal => revealObserver.observe(reveal));

  // 2. MODAL & DATA EXTRACTION
  const modal = document.getElementById('solutionModal');
  const openBtns = document.querySelectorAll('.open-modal-btn');
  const closeBtn = document.getElementById('modalCloseBtn');
  const govForm = document.getElementById('govForm');
  const submitBtn = document.getElementById('submitBtn');
  const challengeCategory = document.getElementById('challenge_category');
  const otherSectorWrapper = document.getElementById('other_sector_wrapper');

  // UPDATE THIS WITH YOUR APPS SCRIPT URL
  const scriptURL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL'; 

  openBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'flex';
  }));
  closeBtn.addEventListener('click', () => modal.style.display = 'none');

  if (challengeCategory) {
    challengeCategory.addEventListener('change', (e) => {
      if (e.target.value === 'Other') {
        otherSectorWrapper.style.display = 'block';
        document.getElementById('other_sector_input').setAttribute('required', 'true');
      } else {
        otherSectorWrapper.style.display = 'none';
        document.getElementById('other_sector_input').removeAttribute('required');
      }
    });
  }

  if (govForm) {
    govForm.addEventListener('submit', e => {
      e.preventDefault();
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Authenticating & Submitting...';
      submitBtn.disabled = true;

      const formData = new FormData(govForm);

      fetch(scriptURL, { method: 'POST', body: formData })
        .then(response => response.json())
        .then(data => {
          if (data.result === 'success') {
            submitBtn.textContent = 'Requisition Logged Successfully';
            submitBtn.style.backgroundColor = '#B57E1F';
            setTimeout(() => {
              modal.style.display = 'none'; 
              govForm.reset();
              submitBtn.textContent = originalText;
              submitBtn.disabled = false;
              submitBtn.style.backgroundColor = ''; 
            }, 3000);
          } else { throw new Error('Database rejection'); }
        })
        .catch(error => {
          console.error('Extraction Error:', error);
          submitBtn.textContent = 'Connection Error. Please retry.';
          submitBtn.disabled = false;
        });
    });
  }

  // 3. REGIONAL BILINGUAL TOGGLE (HINDI)
  const langToggle = document.getElementById('langToggle');
  let isHindi = false;
  
  const translations = {
    navApproach: { en: "The Approach", hi: "हमारा दृष्टिकोण" },
    navInstrument: { en: "Our Instruments", hi: "हमारे उपकरण" },
    navPilot: { en: "Initiate Requisition", hi: "अनुरोध प्रारंभ करें" },
    
    heroTitle: { en: "Fix the administrative gap.<br><span class='serif-em'>Pay only when it works.</span>", hi: "प्रशासनिक अंतराल को सुधारें।<br><span class='serif-em'>केवल सफल होने पर भुगतान करें।</span>" },
    heroSub: { en: "We bypass the heavy capital expenditure of a 36-month tender. Bring us a process that is failing on the ground. We build the instrument, deploy it in the field, and you pay a predictable subscription only once your officers have adopted it.", hi: "हम पारंपरिक निविदाओं के भारी खर्च से बचते हैं। हमें वह प्रक्रिया बताएं जो ज़मीनी स्तर पर विफल हो रही है। हम इसे सुधारने के लिए उपकरण बनाएंगे, तैनात करेंगे, और आप केवल तब भुगतान करेंगे जब आपके अधिकारी इसे अपना लेंगे।" },
    heroBtn: { en: "Requisition a District Pilot", hi: "पायलट प्रोजेक्ट का अनुरोध करें" },
    heroSecBtn: { en: "Review Financial Model", hi: "वित्तीय मॉडल की समीक्षा करें" },
    
    modelEyebrow: { en: "The Procurement Shift", hi: "खरीद प्रक्रिया में बदलाव" },
    modelTitle: { en: "The burden of proof belongs to the vendor.", hi: "प्रमाणित करने की जिम्मेदारी वेंडर की है।" },
    
    cardOldTitle: { en: "The Traditional Tender", hi: "पारंपरिक निविदा (Tender)" },
    cardOldSub: { en: "High political and financial risk for the department.", hi: "विभाग के लिए उच्च राजनीतिक और वित्तीय जोखिम।" },
    cardOldList: { 
      en: "<li>Heavy upfront Capital Expenditure (CapEx).</li><li>Years locked into a rigid contract.</li><li>Department pays even if ground officers reject it.</li><li>Built for the head office, fails in rural offline zones.</li>", 
      hi: "<li>भारी अग्रिम पूंजीगत व्यय (CapEx)।</li><li>वर्षों तक कठोर अनुबंध में बंधे रहना।</li><li>अधिकारी इसे अस्वीकार कर दें, तब भी विभाग भुगतान करता है।</li><li>मुख्यालय के लिए बना, ग्रामीण ऑफ़लाइन क्षेत्रों में विफल।</li>" 
    },
    
    cardNewBadge: { en: "Our Approach", hi: "हमारा दृष्टिकोण" },
    cardNewTitle: { en: "Zero-Risk Subscription", hi: "शून्य-जोखिम सदस्यता (SaaS)" },
    cardNewSub: { en: "We carry the cost of deployment. You pay for outcomes.", hi: "तैनाती की लागत हमारी, आप केवल परिणामों के लिए भुगतान करें।" },
    cardNewList: { 
      en: "<li><strong>Zero Upfront Cost:</strong> No budget lock-in to initiate.</li><li><strong>Pay on Adoption:</strong> Monthly OpEx only when actively used.</li><li><strong>Zero Lock-in:</strong> Pause or scale based on district performance.</li><li><strong>Field-Proven:</strong> Offline-first architecture built for 3G zones.</li>", 
      hi: "<li><strong>शून्य अग्रिम लागत:</strong> शुरुआत के लिए कोई बजट लॉक-इन नहीं।</li><li><strong>अपनाने पर भुगतान:</strong> केवल सक्रिय उपयोग पर मासिक व्यय (OpEx)।</li><li><strong>कोई लॉक-इन नहीं:</strong> ज़िले के प्रदर्शन के आधार पर रोकें या बढ़ाएं।</li><li><strong>ज़मीनी स्तर पर प्रमाणित:</strong> ऑफ़लाइन काम करने में सक्षम।</li>" 
    },
    
    instEyebrow: { en: "Proof of Approach", hi: "दृष्टिकोण का प्रमाण" },
    instBadge: { en: "Built · Ready for deployment", hi: "निर्मित · तैनाती के लिए तैयार" },
    instBody: { en: "Verified student attendance and mid-day meal reconciliation for government schools. A daily, tamper-evident view of who was actually present—showing exactly where meal claims and attendance do not agree.", hi: "सरकारी स्कूलों के लिए सत्यापित उपस्थिति और मिड-डे मील का मिलान। छात्रों की उपस्थिति का दैनिक, सुरक्षित विवरण—जो दर्शाता है कि मील के दावे और वास्तविक उपस्थिति में कहाँ अंतर है।" },
    instBtn: { en: "Inspect the Instrument →", hi: "उपकरण का निरीक्षण करें →" }
  };

  langToggle.addEventListener('click', () => {
    isHindi = !isHindi;
    langToggle.textContent = isHindi ? "English" : "हिंदी";
    
    document.getElementById('navApproach').innerHTML = isHindi ? translations.navApproach.hi : translations.navApproach.en;
    document.getElementById('navInstrument').innerHTML = isHindi ? translations.navInstrument.hi : translations.navInstrument.en;
    document.getElementById('navPilot').innerHTML = isHindi ? translations.navPilot.hi : translations.navPilot.en;
    
    document.getElementById('heroTitle').innerHTML = isHindi ? translations.heroTitle.hi : translations.heroTitle.en;
    document.getElementById('heroSub').innerHTML = isHindi ? translations.heroSub.hi : translations.heroSub.en;
    document.getElementById('heroBtn').innerHTML = isHindi ? translations.heroBtn.hi : translations.heroBtn.en;
    document.getElementById('heroSecBtn').innerHTML = isHindi ? translations.heroSecBtn.hi : translations.heroSecBtn.en;
    
    document.getElementById('modelEyebrow').innerHTML = isHindi ? translations.modelEyebrow.hi : translations.modelEyebrow.en;
    document.getElementById('modelTitle').innerHTML = isHindi ? translations.modelTitle.hi : translations.modelTitle.en;
    
    document.getElementById('cardOldTitle').innerHTML = isHindi ? translations.cardOldTitle.hi : translations.cardOldTitle.en;
    document.getElementById('cardOldSub').innerHTML = isHindi ? translations.cardOldSub.hi : translations.cardOldSub.en;
    document.getElementById('cardOldList').innerHTML = isHindi ? translations.cardOldList.hi : translations.cardOldList.en;
    
    document.getElementById('cardNewBadge').innerHTML = isHindi ? translations.cardNewBadge.hi : translations.cardNewBadge.en;
    document.getElementById('cardNewTitle').innerHTML = isHindi ? translations.cardNewTitle.hi : translations.cardNewTitle.en;
    document.getElementById('cardNewSub').innerHTML = isHindi ? translations.cardNewSub.hi : translations.cardNewSub.en;
    document.getElementById('cardNewList').innerHTML = isHindi ? translations.cardNewList.hi : translations.cardNewList.en;
    
    document.getElementById('instEyebrow').innerHTML = isHindi ? translations.instEyebrow.hi : translations.instEyebrow.en;
    document.getElementById('instBadge').innerHTML = isHindi ? translations.instBadge.hi : translations.instBadge.en;
    document.getElementById('instBody').innerHTML = isHindi ? translations.instBody.hi : translations.instBody.en;
    document.getElementById('instBtn').innerHTML = isHindi ? translations.instBtn.hi : translations.instBtn.en;
  });
});
