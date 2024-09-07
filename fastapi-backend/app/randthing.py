def yield_mda_chunks(content):
    for i in range(0, len(content), 5):
        if i+5 > len(content):
            yield content[i:]
        else:
            yield content[i:i+5]

def new_func():
    print('here')
    content = "This is some dummy text to test mda_chunks"
    mda_score = {"positive": 0, "neutral": 0, "negative": 0}
    mda_chunked = yield_mda_chunks(content)
    print("in test")
    for chunk in mda_chunked:
        print(chunk)

if __name__ == "__main__":
    # print("running")
    # new_func()
    # print("after")
    print(round(100.5))
    
