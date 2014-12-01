// Copyright Naked Objects Group Ltd, 45 Station Road, Henley on Thames, UK, RG9 1AT
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and limitations under the License.

using System;
using NakedObjects.Architecture.Facet;
using NakedObjects.Architecture.Spec;

namespace NakedObjects.Meta.Facet {
    [Serializable]
    public abstract class MultiLineFacetAbstract : FacetAbstract, IMultiLineFacet {
        private readonly int numberOfLines;
        private readonly int width;

        protected MultiLineFacetAbstract(int numberOfLines, int width, ISpecification holder)
            : base(Type, holder) {
            this.numberOfLines = numberOfLines;
            this.width = width;
        }

        public static Type Type {
            get { return typeof (IMultiLineFacet); }
        }

        #region IMultiLineFacet Members

        public virtual int NumberOfLines {
            get { return numberOfLines; }
        }

        public virtual int Width {
            get { return width; }
        }

        #endregion

        protected override string ToStringValues() {
            return string.Format("lines={0}, width={1}", numberOfLines, width);
        }
    }
}