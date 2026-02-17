"""
UBL 2.1 Format Generator for LHDN e-Invoicing
Generates UBL 2.1 compliant XML and JSON formats for invoice submission
"""

import json
import logging
from typing import Dict, Any, Optional, List
from decimal import Decimal
from datetime import datetime
from django.utils import timezone

logger = logging.getLogger(__name__)


class UBL21Generator:
    """
    Generator for UBL 2.1 format (Universal Business Language 2.1)
    Compliant with LHDN e-Invoicing requirements
    """
    
    UBL_VERSION = "2.1"
    CUSTOMIZATION_ID = "LHDN-2023-1"
    PROFILE_ID = "LHDN-eInvoice"
    
    def __init__(self):
        """Initialize UBL 2.1 generator"""
        pass
    
    def generate_json(self, invoice, company, customer) -> Dict[str, Any]:
        """
        Generate UBL 2.1 JSON format from Django invoice model
        
        Args:
            invoice: Invoice model instance
            company: Company model instance (seller)
            customer: Customer model instance (buyer)
            
        Returns:
            UBL 2.1 JSON format as dictionary
        """
        try:
            ubl_invoice = {
                "Invoice": {
                    "customizationID": self.CUSTOMIZATION_ID,
                    "profileID": self.PROFILE_ID,
                    "ID": invoice.invoice_number,
                    "issueDate": invoice.invoice_date.isoformat(),
                    "dueDate": invoice.due_date.isoformat(),
                    "invoiceTypeCode": {
                        "listID": "0101",
                        "listAgencyID": "LHDN",
                        "listVersionID": "2023-1",
                        "_": "01"  # 01=Tax Invoice
                    },
                    "documentCurrencyCode": invoice.currency or "MYR",
                    "buyerReference": str(customer.id) if hasattr(customer, 'id') else "",
                    
                    # Seller/Supplier Party
                    "AccountingSupplierParty": self._generate_supplier_party(company),
                    
                    # Buyer/Customer Party
                    "AccountingCustomerParty": self._generate_customer_party(customer),
                    
                    # Tax Totals
                    "TaxTotal": self._generate_tax_total(invoice),
                    
                    # Monetary Totals
                    "LegalMonetaryTotal": self._generate_monetary_total(invoice),
                    
                    # Invoice Lines
                    "InvoiceLine": self._generate_invoice_lines(invoice),
                    
                    # Additional fields
                    "Note": invoice.notes if invoice.notes else [],
                }
            }
            
            return ubl_invoice
            
        except Exception as e:
            logger.error(f"Error generating UBL 2.1 JSON: {e}", exc_info=True)
            raise Exception(f"Failed to generate UBL format: {str(e)}")
    
    def _generate_supplier_party(self, company) -> Dict[str, Any]:
        """Generate supplier/company party information"""
        return {
            "Party": {
                "PartyIdentification": [
                    {
                        "ID": {
                            "_": company.registration_number or company.tax_id or "",
                            "schemeID": "SSM" if company.registration_number else "TAX"
                        }
                    }
                ],
                "PartyName": {
                    "Name": company.legal_name or company.name
                },
                "PostalAddress": {
                    "StreetName": company.address or "",
                    "CityName": company.city or "",
                    "PostalZone": company.postal_code or "",
                    "CountrySubentity": company.state or "",
                    "Country": {
                        "IdentificationCode": company.country or "MY"
                    }
                },
                "Contact": {
                    "Telephone": company.phone or "",
                    "ElectronicMail": company.email or ""
                }
            }
        }
    
    def _generate_customer_party(self, customer) -> Dict[str, Any]:
        """Generate customer/buyer party information"""
        # Extract customer details
        customer_name = getattr(customer, 'name', '')
        customer_address = getattr(customer, 'address', '') or getattr(customer, 'billing_address', '')
        customer_city = getattr(customer, 'city', '') or getattr(customer, 'billing_city', '')
        customer_state = getattr(customer, 'state', '') or getattr(customer, 'billing_state', '')
        customer_postal = getattr(customer, 'postal_code', '') or getattr(customer, 'billing_postal_code', '')
        customer_country = getattr(customer, 'country', 'MY') or getattr(customer, 'billing_country', 'MY')
        customer_phone = getattr(customer, 'phone', '') or getattr(customer, 'phone_number', '')
        customer_email = getattr(customer, 'email', '')
        customer_registration = getattr(customer, 'registration_number', '') or getattr(customer, 'tax_id', '')
        
        party = {
            "Party": {
                "PartyName": {
                    "Name": customer_name
                },
                "PostalAddress": {
                    "StreetName": customer_address or "",
                    "CityName": customer_city or "",
                    "PostalZone": customer_postal or "",
                    "CountrySubentity": customer_state or "",
                    "Country": {
                        "IdentificationCode": customer_country or "MY"
                    }
                }
            }
        }
        
        # Add registration number if available (for B2B)
        if customer_registration:
            party["Party"]["PartyIdentification"] = [{
                "ID": {
                    "_": customer_registration,
                    "schemeID": "SSM"  # Assuming SSM, could be ROC or other
                }
            }]
        
        # Add contact if available
        if customer_phone or customer_email:
            party["Party"]["Contact"] = {}
            if customer_phone:
                party["Party"]["Contact"]["Telephone"] = customer_phone
            if customer_email:
                party["Party"]["Contact"]["ElectronicMail"] = customer_email
        
        return party
    
    def _generate_tax_total(self, invoice) -> Dict[str, Any]:
        """Generate tax total information"""
        tax_amount = float(invoice.tax_amount) if invoice.tax_amount else 0.0
        
        return {
            "TaxAmount": {
                "currencyID": invoice.currency or "MYR",
                "_": f"{tax_amount:.2f}"
            },
            "TaxSubtotal": [
                {
                    "TaxableAmount": {
                        "currencyID": invoice.currency or "MYR",
                        "_": f"{float(invoice.subtotal):.2f}"
                    },
                    "TaxAmount": {
                        "currencyID": invoice.currency or "MYR",
                        "_": f"{tax_amount:.2f}"
                    },
                    "TaxCategory": {
                        "ID": "S",
                        "Percent": f"{float(invoice.lines.first().tax_rate) if invoice.lines.exists() else 0:.2f}",
                        "TaxScheme": {
                            "ID": "SST",
                            "Name": "Sales and Service Tax"
                        }
                    }
                }
            ]
        }
    
    def _generate_monetary_total(self, invoice) -> Dict[str, Any]:
        """Generate monetary total information"""
        currency = invoice.currency or "MYR"
        subtotal = float(invoice.subtotal) if invoice.subtotal else 0.0
        tax_amount = float(invoice.tax_amount) if invoice.tax_amount else 0.0
        discount = float(invoice.discount_amount) if invoice.discount_amount else 0.0
        total = float(invoice.total_amount) if invoice.total_amount else 0.0
        
        return {
            "LineExtensionAmount": {
                "currencyID": currency,
                "_": f"{subtotal:.2f}"
            },
            "TaxExclusiveAmount": {
                "currencyID": currency,
                "_": f"{subtotal:.2f}"
            },
            "TaxInclusiveAmount": {
                "currencyID": currency,
                "_": f"{total:.2f}"
            },
            "PayableAmount": {
                "currencyID": currency,
                "_": f"{total:.2f}"
            }
        }
    
    def _generate_invoice_lines(self, invoice) -> List[Dict[str, Any]]:
        """Generate invoice line items"""
        lines = []
        
        for idx, line in enumerate(invoice.lines.all(), start=1):
            quantity = float(line.quantity)
            unit_price = float(line.unit_price)
            line_total = float(line.line_total)
            tax_rate = float(line.tax_rate) if line.tax_rate else 0.0
            discount_rate = float(line.discount_rate) if line.discount_rate else 0.0
            
            line_item = {
                "ID": str(idx),
                "InvoicedQuantity": {
                    "unitCode": "C62",  # Unit code for pieces/items
                    "_": f"{quantity:.2f}"
                },
                "LineExtensionAmount": {
                    "currencyID": invoice.currency or "MYR",
                    "_": f"{line_total:.2f}"
                },
                "Item": {
                    "Description": line.description,
                    "Name": line.description,
                },
                "Price": {
                    "PriceAmount": {
                        "currencyID": invoice.currency or "MYR",
                        "_": f"{unit_price:.2f}"
                    }
                }
            }
            
            # Add MSIC code if available
            if hasattr(line, 'msic_code') and line.msic_code:
                line_item["Item"]["SellersItemIdentification"] = {
                    "ID": line.msic_code
                }
            
            # Add tax information
            if tax_rate > 0:
                tax_category_id = "S"  # Standard rate
                if hasattr(line, 'tax_category'):
                    tax_category_map = {
                        'standard': 'S',
                        'zero_rated': 'Z',
                        'exempt': 'E',
                        'out_of_scope': 'O'
                    }
                    tax_category_id = tax_category_map.get(line.tax_category, 'S')
                
                line_item["TaxTotal"] = {
                    "TaxAmount": {
                        "currencyID": invoice.currency or "MYR",
                        "_": f"{(line_total * tax_rate / 100):.2f}"
                    },
                    "TaxSubtotal": {
                        "TaxableAmount": {
                            "currencyID": invoice.currency or "MYR",
                            "_": f"{line_total:.2f}"
                        },
                        "TaxAmount": {
                            "currencyID": invoice.currency or "MYR",
                            "_": f"{(line_total * tax_rate / 100):.2f}"
                        },
                        "TaxCategory": {
                            "ID": tax_category_id,
                            "Percent": f"{tax_rate:.2f}",
                            "TaxScheme": {
                                "ID": "SST",
                                "Name": "Sales and Service Tax"
                            }
                        }
                    }
                }
            
            lines.append(line_item)
        
        return lines
    
    def validate_ubl_data(self, ubl_data: Dict[str, Any]) -> tuple[bool, list[str]]:
        """
        Validate UBL 2.1 data structure
        
        Args:
            ubl_data: UBL formatted data dictionary
            
        Returns:
            Tuple of (is_valid, errors_list)
        """
        errors = []
        
        if not ubl_data or 'Invoice' not in ubl_data:
            errors.append("Missing 'Invoice' root element")
            return False, errors
        
        invoice = ubl_data['Invoice']
        
        # Check mandatory fields
        mandatory_fields = ['ID', 'issueDate', 'dueDate', 'invoiceTypeCode']
        for field in mandatory_fields:
            if field not in invoice:
                errors.append(f"Missing mandatory field: {field}")
        
        # Check supplier party
        if 'AccountingSupplierParty' not in invoice:
            errors.append("Missing mandatory field: AccountingSupplierParty")
        
        # Check customer party
        if 'AccountingCustomerParty' not in invoice:
            errors.append("Missing mandatory field: AccountingCustomerParty")
        
        # Check totals
        if 'LegalMonetaryTotal' not in invoice:
            errors.append("Missing mandatory field: LegalMonetaryTotal")
        
        # Check invoice lines
        if 'InvoiceLine' not in invoice or not invoice['InvoiceLine']:
            errors.append("Missing mandatory field: InvoiceLine (at least one line item required)")
        
        return len(errors) == 0, errors

