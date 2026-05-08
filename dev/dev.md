SelectionBox fiscal_residence = { Italy, Japan }
SelectionBox preferred_currency = { EUR, JPY, USD }
Checkbox entity_type = { natural_person, legal_entity }

IF entity_type = natural_person
  IF fiscal_residence = Italy:
    Textbox last_name: Cognome / Last Name
    Textbox first_name: Nome / First Name
    Textbox fiscal_code: Codice Fiscale / Fiscal Code
    SelectionBox document_signing = { PEC, eIDAS }
  
  IF fiscal_residence = Japan:
    Coming soon


Checkbox sanction_declaration = "By submitting this form, I expressly certify that I am not, and have not been, a sanctioned entity under any applicable national or international authority.";

Checkbox dsa_declaration = "By submitting this form, I acknowledge and accept that this submission, including any electronic signatures, shall be governed by the eIDAS Regulation (EU No 910/2014) and carry full legal effect accordingly.";

