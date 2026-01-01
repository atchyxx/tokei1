import streamlit as st
import numpy as np
import pandas as pd
from PIL import Image

st.title("Streamlit 超入門")

st.write('プログレスバーの表示')
'Start!!!'

latest_iteration = st.empty()
bar = st.progress(0)

import  time

for i in range(100):
    latest_iteration.text(f'Iteration {i+1}')
    bar.progress(i + 1)
    time.sleep(0.1)

'Done!!!!!'

left_column, right_column = st.columns(2)
button = left_column.button('右カラムに文字を表示')
if button:
    right_column.write('ここは右カラム')

st.expander('詳細情報')
st.write('ここに詳細情報を表示します。')

# text = st.text_input('あなたの趣味を教えてください。')
# 'あなたの趣味は', text, 'です。'

# option = st.selectbox(
#     'あなたが好きな数字を教えてください',
#     list(range(1,11))
# )

# 'あなたが選んだ数字は ',option,' です。'
# condition = st.slider('あなたの今の調子は？', 0, 100, 50)
# 'コンディション：', condition, 

# if st.checkbox('Show Image'):
#     img = Image.open('lena.jpg')
#     st.image(img, caption='Lena', use_column_width=True)



# df = pd.DataFrame(
#         np.random.rand(100, 2)/[50, 50]+[35.65, 139.70],
#     columns=['lat', 'lon']
# )
# st.map(df)


