![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# @custom-js/n8n-nodes-pdf-toolkit

This is an n8n community node. It lets interact with official API of [customJS API](https://www.customjs.space/)

This package contains nodes to help you generate PDF from HTML, merge multiple PDF files, take a screenshot of specific website using URL, convert PDF to PNG, convert PDF to Text and extract pages from PDF.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

- [Installation](#installation)
- [Credentials](#credentials)
- [Usage](#usage)
- [Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

Use the package at [here](https://www.npmjs.com/package/@custom-js/n8n-nodes-pdf-toolkit).

## Credentials

Add your Api Key and store securely


## Usage

### "HTML to PDF" node

- Add the HTML to PDF node to your workflow
- Configure your CustomJS API credentials
- Input your HTML content
- Execute the workflow to generate PDF

### "Merge PDFs" node

- Add the Merge PDFs node to your workflow
- Configure your CustomJS API credentials
- Input PDF files as an array with the same field name to merge.
- If total size of files exceeds 6MB, pass it as an array of URL seperated by comma.
- Execute the workflow to get merged PDF file.

### "Website Screenshot" node

- Add the Website Screenshot node to your workflow
- Configure your CustomJS API credentials
- Input your URL of website to take screenshot
- Execute the workflow to take a screenshot of that website

### "Compress PDF" node

- Add the Compress PDF node to your workflow
- Configure your CustomJS API credentials
- Input Binary PDF file for compression to compress
- If size of the binary file exceeds 6MB, pass it as URL.
- Execute the workflow to get a compression of PDF file.

### "PDF To PNG" node

- Add the PDF To PNG node to your workflow
- Configure your CustomJS API credentials
- Input Binary PDF file for conversion
- If size of the binary file exceeds 6MB, pass it as URL.
- Execute the workflow to get converted PNG file.

### "PDF To Text" node

- Add the PDF To Text node to your workflow
- Configure your CustomJS API credentials
- Input Binary PDF file for conversion
- If size of the binary file exceeds 6MB, pass it as URL.
- Execute the workflow to get converted Text file.

### "Extract Pages From PDF" node

- Add the Extract Pages From PDF node to your workflow
- Configure your CustomJS API credentials
- Input Binary PDF file for conversion
- If size of the binary file exceeds 6MB, pass it as URL.
- Execute the workflow to get converted Pages from PDF file.

### "SSL Checker" node

- Add the **SSL Checker** node to your workflow.
- Configure your CustomJS API credentials.
- Input the domain you want to check (e.g., `example.com`).
- Execute the workflow to get information about the SSL certificate, including the expiration date.

### "Scraper" node

- Add the **Scraper** node to your workflow.
- Configure your CustomJS API credentials.
- Input the website URL you want to scrape (must start with `https://`).
- Optionally, define user actions (click, type, wait) to interact with page elements using selectors.
- Choose the return type:  
  - **Raw HTML**: Get the HTML content of the page.  
  - **Screenshot (PNG)**: Get a screenshot of the page.
- Enable or disable debug mode to control error handling for missing elements.
- Execute the workflow to scrape the website and receive the desired output.

### "Markdown to HTML" node

- Add the **Markdown to HTML** node to your workflow.
- Configure your CustomJS API credentials.
- Input the Markdown content you want to convert to HTML.
- Execute the workflow to get the converted HTML content.

### "HTML to Docx (Word)" node

- Add the **HTML to Docx (Word)** node to your workflow.
- Configure your CustomJS API credentials.
- Input the HTML content you want to convert to Docx (Word).
- Execute the workflow to get the converted Docx (Word) file.


### "PDF Form Fill" node

- Add the **PDF Form Fill** node to your workflow.
- Configure your CustomJS API credentials.
- Input the PDF file you want to fill out.
- Define the form fields and their values.
- Execute the workflow to get the filled-out PDF file.

### "Get PDF Form Field Names" node

- Add the **Get PDF Form Field Names** node to your workflow.
- Configure your CustomJS API credentials.
- Input the PDF file you want to get form field names from.
- Execute the workflow to get the form field names.

### "Invoice Generator" node

- Add the **Invoice Generator** node to your workflow.
- Configure your CustomJS API credentials.
- Select a PDF template.
- Fill in the issuer, payment, recipient, and billing information.
- Add items to the invoice.
- Execute the workflow to generate the PDF invoice.

### "JSON to TOON" node

- Add the **JSON to TOON** node to your workflow.
- Configure your CustomJS API credentials.
- Input your JSON data.
- Execute the workflow to convert JSON to TOON format.
- TOON format can reduce AI tokenization by 40% to 60% when working with language models.

### "TOON to JSON" node

- Add the **TOON to JSON** node to your workflow.
- Configure your CustomJS API credentials.
- Input your TOON data.
- Execute the workflow to convert TOON to JSON format.

### Host HTML Page node

- Add the **Host HTML Page** node to your workflow.
- Configure your CustomJS API credentials.
- Input your HTML content.
- Execute the workflow to host the HTML page.
- You can then access the hosted page via the provided URL.