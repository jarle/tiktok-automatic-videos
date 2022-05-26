import json
import random
import re

with open("emoji-suggestions.json") as f:
    suggestions = json.load(f)["suggestions"]

with open("all_emojis.json") as f:
    all_emojis = json.load(f)
    all_emojis.reverse()

with open("neutral_emojis.json") as f:
    neutral_emojis = json.load(f)


def neutral_emoji(seed):
    random.seed(seed)
    if random.randint(0, 100) > 50:
        return random.choice(neutral_emojis)
    return ""


def suggest_emoji(phrase):
    phrase = phrase.lower().strip()
    phrase = phrase.replace(",", "")
    phrase = re.sub(r"\?", "", phrase)
    phrase = re.sub(r"\.", "", phrase)
    phrase = re.sub(r",", "", phrase)

    for emoji in all_emojis:
        pattern = f"\\b{emoji.replace('-', ' ')}\\b"
        if len(re.findall(pattern, phrase)) > 0:
            return emoji

        without_s = re.sub(r"s\b", "", phrase)
        if len(re.findall(pattern, without_s)) > 0:
            return emoji

        without_er = re.sub(r"er\b", "", phrase)
        if len(re.findall(pattern, without_er)) > 0:
            return emoji

    for suggestion in suggestions:
        for keyword in suggestion["keywords"]:
            pattern = f"\\b{keyword}\\b"
            if re.findall(pattern, phrase):
                return suggestion["emoji"]

    return None


if __name__ == '__main__':
    print(suggestions)
    print(all_emojis)
    print(suggest_emoji("I love going for walks"))
    print(suggest_emoji("I go to school"))
    print(suggest_emoji("give me a door,"))
    print(suggest_emoji("fofo wedding?"))
    print(suggest_emoji("I (27M) have a twin sister (27F)"))
    print(suggest_emoji("I proposed and she said yes."))
    print(suggest_emoji("Press like and comment what you think."))
    print(suggest_emoji("Rob found out about the affair 3 years later."))
    print(suggest_emoji("Am I really wrong for wanting"))
    print(suggest_emoji("older man"))
    print(suggest_emoji("about to be eight months old."))
