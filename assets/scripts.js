// Google Translate init
function googleTranslateElementInit(){
  new google.translate.TranslateElement({pageLanguage:'en', includedLanguages:'en,sw', layout: google.translate.TranslateElement.InlineLayout.SIMPLE}, 'google_translate_element');
}

// Tabs for Industry Solutions
function initTabs(){
  const tabs = document.querySelectorAll('[data-tab]');
  const panes = document.querySelectorAll('[data-pane]');
  tabs.forEach(tab=>{
    tab.addEventListener('click',()=>{
      const key = tab.getAttribute('data-tab');
      tabs.forEach(t=>t.classList.remove('active'));
      panes.forEach(p=>p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.querySelector(`[data-pane="${key}"]`);
      if(target) target.classList.add('active');
    });
  });
}

// Web3Forms simple handler (optional enhancement)
document.addEventListener('DOMContentLoaded',()=>{
  initTabs();

  // Claspo popup trigger (as requested)
  try{
    if(typeof claspo === 'function'){
      claspo('showWidget', { formVariantId: 'f60360v60360' });
    }
  }catch(e){/* ignore */}

  // Lead magnet modal toggles
  const openLead = document.querySelectorAll('[data-open-lead]');
  const closeLead = document.querySelectorAll('[data-close-lead]');
  const modal = document.getElementById('lead-modal');
  openLead.forEach(btn=>btn.addEventListener('click',()=>{
    if(modal) modal.style.display='grid';
  }));
  closeLead.forEach(btn=>btn.addEventListener('click',()=>{
    if(modal) modal.style.display='none';
  }));
});