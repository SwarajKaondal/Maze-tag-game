import sys
import json

file_name = sys.argv[1]

object_data = {
    "id": "Frog",
    "material": {
        "ambient": [0.3, 0.0, 0.0],
        "diffuse": [0.3, 0.0, 0.0],
        "specular": [0.3, 0.0, 0.0],
        "n": 40,
        "alpha": 1.0,
        "texture": "frog.jpg",
    },
}

file = open(file_name, "r")
file_data = file.read().split("\n")
file.close()
vertices = []
vt = []
vertex_normals = []
final_vertices = []
final_vt = []
final_vertex_normals = []
faces = []
vertices_count = 0
d = {}
print(file_data)
face_count = 0
for line in file_data:
    if line.startswith("v "):
        vertices.append(list(map(float, line[2:].split(" "))))
        vertices_count += 1
    elif line.startswith("vn "):
        vertex_normals.append(list(map(float, line[3:].split(" "))))
    elif line.startswith("vt "):
        vt.append(list(map(float, line[3:].split(" "))))
    elif line.startswith("f "):
        # if len(final_vertex_normals) == 0:
        #     final_vertex_normals = [0] * vertices_count
        temp_face = []
        for face in line[2:].split(" "):
            normal = int(face.split("/")[2]) - 1
            vertex = int(face.split("/")[0]) - 1
            texture = int(face.split("/")[1]) - 1
            final_vertices.append(vertices[vertex])
            final_vertex_normals.append(vertex_normals[normal])
            final_vt.append(
                [
                    1 - vt[texture][0],
                    vt[texture][1],
                ]
            )

            # print(f, i)
            # if not d.get(f, False):
            #     d[f] = True
            #     final_vertex_normals[f] = vertex_normals[i]
            temp_face.append(len(final_vertices) - 1)
        faces.append(temp_face)

print()
print(vertices)
print()
print(final_vertex_normals)
print()
print(faces)
object_data = {
    **object_data,
    "vertices": final_vertices,
    "normals": final_vertex_normals,
    "triangles": faces,
    "uvs": final_vt,
}
print(json.dumps(object_data))
f = open(f"../{file_name.split('.')[0]}.json", "w")
f.write(json.dumps(object_data))
f.close()
