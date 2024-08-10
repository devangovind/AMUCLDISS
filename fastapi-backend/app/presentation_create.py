import pptx
from pptx.util import Inches
import os
import re

class CreatePPT:
    def __init__(self):
        self.presentation = pptx.Presentation(os.path.join("pres", "template.pptx"))
        self.content_to_slide_dict = {"revenue": 1, "operatingincome": 2, "kpis": 3}
        self.outputpath = os.path.join("pres", "output.pptx")
    
    def list_text_boxes(self, slide_num):
        slide = self.presentation.slides[slide_num]
        text_boxes = []
        for shape in slide.shapes:
            if shape.has_text_frame and shape.text:
                text_boxes.append(shape.text)
        return text_boxes
    def parse_content(self, content):
        text = re.sub(r'### (.+)', r'\1', content)
        # Replace bold text denoted by '**'
        text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
        text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)
        text = text.replace("\n", " ")
        return text


    def update_textbox(self, slide, to_replace, content):
        print("\n", content)
        try:
            slide = self.presentation.slides[self.content_to_slide_dict[slide]]
        except:
            return
        content = self.parse_content(content)
        print("\n", content)
        for shape in slide.shapes:
            if shape.has_text_frame and shape.text:
                if shape.text == to_replace:
                    text_frame = shape.text_frame
                    first_para = text_frame.paragraphs[0]
                    first_run = first_para.runs[0] if first_para.runs else first_para.add_run()
                    font = first_run.font
                    font_name  = font.name
                    font_size = font.size
                    # font_colour = font.color.rgb
                    text_frame.clear()
                    new_run = text_frame.paragraphs[0].add_run()
                    new_run.text = content
                    new_run.font.name = font_name
                    new_run.font.size = font_size 
                    # new_run.font.color.rgb = font_colour 
        # self.add_image_to_slide(slide, to_replace)
        self.presentation.save(self.outputpath)
    

    def add_image_to_slide(self,slide, metric):
        try:
            slide = self.presentation.slides[self.content_to_slide_dict[slide]]
        except:
            return
        images = []
        if metric == "operatingincome": metric = "operating"
        print("DIR", os.listdir("plots"))
        for file in os.listdir("plots"):
            print(file)
            if metric in file:
                images.append(os.path.join("plots", file))
        print(images, metric)
        
        x = 0
        for image in images:
            slide.shapes.add_picture(image, Inches(7.5), Inches(0.5+x), Inches(5))
            #                               left, top, width, height
            x+= 3.5
        self.presentation.save(self.outputpath)
        return 
# if __name__ == "__main__":
#     # print(os.path.join("pres", "input.pptx"))
#     ppt = CreatePPT()