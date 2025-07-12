import os

import google.generativeai as genai

api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# models = genai.list_models()
# for m in models:
#     print(m)

# Setting the key to env variable
# In PowerShell, you can set the environment variable like this:

# Gemini API
# $env:GEMINI_API_KEY = "AIzaSyAEqoOj3214AabRW4ikHv2Ye6LYzphBhWk"


model = genai.GenerativeModel("gemini-2.5-flash")
# model = genai.GenerativeModel("gemini-pro")


response = model.generate_content("HI !")
print(response.text)
